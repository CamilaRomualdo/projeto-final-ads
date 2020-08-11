import React from "react";
import {Comment, Segment} from "semantic-ui-react";
import firebase from "../../core/service/firebase";
import TopicHeader from "./topic-header";
import MessageSendForm from "./message-send-form";
import Message from "./message";
import TypingDisplay from "./typing-display";
import Skeleton from "./skeleton";
import {connect} from "react-redux";
import {setUserPosts} from "../../core/store/actions/index.action";

class All extends React.Component {

    state = {
        privateMessage: this.props.isPrivateMessage,
        privateMessagesRef: firebase.database().ref("mensagensPrivada"),
        messagesRef: firebase.database().ref("mensagens"),
        messages: [],
        messagesLoading: true,
        topic: this.props.isTopic,
        isFavoriteTopic: false,
        user: this.props.currentUser,
        usersRef: firebase.database().ref("usuarios"),
        numUniqueUsers: "",
        searchTerm: "",
        searchLoading: false,
        searchResults: [],
        typingRef: firebase.database().ref("digitando"),
        typingUsers: [],
        connectedRef: firebase.database().ref(".info/connected"),
        listeners: []
    }
    componentDidMount() {
        const {topic, user, listeners} = this.state;
        if (topic && user) {
            this.removeListeners(listeners);
            this.addListeners(topic.id);
            this.addUserStarsListener(topic.id, user.uid);
        }
    }

    componentWillUnmount() {
        this.removeListeners(this.state.listeners);
        this.state.connectedRef.off();
    }

    removeListeners = listeners => {
        listeners.forEach(listener => {
            listener.ref.child(listener.id).off(listener.event);
        });
    };

    componentDidUpdate(prevProps, prevState) {
        if (this.messagesEnd) {
            this.scrollToBottom();
        }
    }

    addToListeners = (id, ref, event) => {
        const index = this.state.listeners.findIndex(listener => {
            return (
                listener.id === id && listener.ref === ref && listener.event === event
            );
        });
        if (index === -1) {
            const newListener = {id, ref, event};
            this.setState({listeners: this.state.listeners.concat(newListener)});
        }
    };

    scrollToBottom = () => {
        this.messagesEnd.scrollIntoView({
            behavior: "smooth"
        });
    };

    addListeners = topicId => {
        this.addMessageListener(topicId);
        this.addTypingListeners(topicId);
    };

    addTypingListeners = topicId => {
        let typingUsers = [];
        this.state.typingRef.child(topicId).on("child_added", snap => {
            if (snap.key !== this.state.user.uid) {
                typingUsers = typingUsers.concat({
                    id: snap.key,
                    name: snap.val()
                });
                this.setState({typingUsers});
            }
        });
        this.addToListeners(topicId, this.state.typingRef, "child_added");
        this.state.typingRef.child(topicId).on("child_removed", snap => {
            const index = typingUsers.findIndex(user => user.id === snap.key);
            if (index !== -1) {
                typingUsers = typingUsers.filter(user => user.id !== snap.key);
                this.setState({typingUsers});
            }
        });
        this.addToListeners(topicId, this.state.typingRef, "child_removed");
        this.state.connectedRef.on("value", snap => {
            if (snap.val() === true) {
                this.state.typingRef
                    .child(topicId)
                    .child(this.state.user.uid)
                    .onDisconnect()
                    .remove(err => {
                        if (err !== null) {
                            console.error(err);
                        }
                    });
            }
        });
    };

    addMessageListener = topicId => {
        let loadedMessages = [];
        const ref = this.getMessagesRef();
        ref.child(topicId).on("child_added", snap => {
            loadedMessages.push(snap.val());
            this.setState({
                messages: loadedMessages,
                messagesLoading: false
            });
            this.countUniqueUsers(loadedMessages);
            this.countUserPosts(loadedMessages);
        });
        this.addToListeners(topicId, ref, "child_added");
    };

    addUserStarsListener = (topicId, userId) => {
        this.state.usersRef
            .child(userId)
            .child("topicosFavorito")
            .once("value")
            .then(data => {
                if (data.val() !== null) {
                    const topicIds = Object.keys(data.val());
                    const prevFavorite = topicIds.includes(topicId);
                    this.setState({isFavoriteTopic: prevFavorite});
                }
            });
    };

    getMessagesRef = () => {
        const {messagesRef, privateMessagesRef, privateMessage} = this.state;
        return privateMessage ? privateMessagesRef : messagesRef;
    };

    handleStar = () => {
        this.setState(
            prevState => ({
                isFavoriteTopic: !prevState.isFavoriteTopic
            }),
            () => this.starTopic()
        );
    };

    starTopic = () => {
        if (this.state.isFavoriteTopic) {
            this.state.usersRef.child(`${this.state.user.uid}/topicosFavorito`).update({
                [this.state.topic.id]: {
                    name: this.state.topic.name,
                    details: this.state.topic.details,
                    createdBy: {
                        name: this.state.topic.createdBy.name,
                        avatar: this.state.topic.createdBy.avatar
                    }
                }
            });
        } else {
            this.state.usersRef
                .child(`${this.state.user.uid}/topicosFavorito`)
                .child(this.state.topic.id)
                .remove(err => {
                    if (err !== null) {
                        console.error(err);
                    }
                });
        }
    };

    handleSearchChange = event => {
        this.setState(
            {
                searchTerm: event.target.value,
                searchLoading: true
            },
            () => this.handleSearchMessages()
        );
    };

    handleSearchMessages = () => {
        const topicMessages = [...this.state.messages];
        const regex = new RegExp(this.state.searchTerm, "gi");
        const searchResults = topicMessages.reduce((acc, message) => {
            if ((message.content && message.content.match(regex)) ||
                message.user.name.match(regex)
            ) {
                acc.push(message);
            }
            return acc;
        }, []);
        this.setState({searchResults});
        setTimeout(() => this.setState({searchLoading: false}), 1000);
    };

    countUniqueUsers = messages => {
        const uniqueUsers = messages.reduce((acc, message) => {
            if (!acc.includes(message.user.name)) {
                acc.push(message.user.name);
            }
            return acc;
        }, []);
        const plural = uniqueUsers.length > 1 || uniqueUsers.length === 0;
        const numUniqueUsers = `${uniqueUsers.length} participante${plural ? "s" : ""}`;
        this.setState({numUniqueUsers});
    };

    countUserPosts = messages => {
        let userPosts = messages.reduce((acc, message) => {
            if (message.user.name in acc) {
                acc[message.user.name].count += 1;
            } else {
                acc[message.user.name] = {
                    avatar: message.user.avatar,
                    count: 1
                };
            }
            return acc;
        }, {});
        this.props.setUserPosts(userPosts);
    };

    displayMessages = messages => messages.length > 0 && messages.map(message => (
            <Message
                key={message.timestamp}
                message={message}
                user={this.state.user}
            />
        ));

    displayTopicName = topic => {
        return topic ? `${this.state.privateMessage ? "Mensagem para @" : "#"}${topic.name}` : "";
    };

    displayTypingUsers = users =>
        users.length > 0 &&
        users.map(user => (
            <div
                style={{alignItems: "center", display: "flex", marginBottom: "0.2em"}}
                key={user.id}
            >
                <span className="typingUser">{user.name} está digitando...</span> <TypingDisplay/>
            </div>
        ));

    displayMessageSkeleton = loading =>
        loading ? (
            <React.Fragment>
                {[...Array(10)].map((_, i) => (
                    <Skeleton key={i}/>
                ))}
            </React.Fragment>
        ) : null;

    render() {
        const {isFavoriteTopic, messages, messagesLoading, messagesRef, numUniqueUsers, privateMessage, searchLoading,
               searchResults, searchTerm, topic, typingUsers, user} = this.state;
        return (
            <React.Fragment>
                <TopicHeader
                    topicName={this.displayTopicName(topic)}
                    numUniqueUsers={numUniqueUsers}
                    handleSearchChange={this.handleSearchChange}
                    searchLoading={searchLoading}
                    isPrivateMessage={privateMessage}
                    handleStar={this.handleStar}
                    isFavoriteTopic={isFavoriteTopic}
                />
                <Segment>
                    <Comment.Group className="messages">
                        {this.displayMessageSkeleton(messagesLoading)}
                        {searchTerm
                            ? this.displayMessages(searchResults)
                            : this.displayMessages(messages)}
                        {this.displayTypingUsers(typingUsers)}
                        <div ref={node => (this.messagesEnd = node)}/>
                    </Comment.Group>
                </Segment>
                <MessageSendForm
                    messagesRef={messagesRef}
                    isTopic={topic}
                    currentUser={user}
                    isPrivateMessage={privateMessage}
                    getMessagesRef={this.getMessagesRef}
                />
            </React.Fragment>
        );
    }
}

export default connect(null, {setUserPosts})(All);
