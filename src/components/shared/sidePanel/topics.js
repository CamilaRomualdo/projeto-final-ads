import React from "react";
import firebase from "../../../core/service/firebase";
// prettier-ignore
import {Button, Form, Icon, Input, Label, Menu, Modal} from "semantic-ui-react";
import {connect} from "react-redux";
import {setTopic, setPrivateMessage} from "../../../core/store/actions/index.action";

class Topics extends React.Component {

    state = {
        activeTopic: "",
        user: this.props.currentUser,
        topic: null,
        topics: [],
        topicName: "",
        topicDetails: "",
        topicsRef: firebase.database().ref("topicos"),
        messagesRef: firebase.database().ref("mensagens"),
        typingRef: firebase.database().ref("digitando"),
        notifications: [],
        modal: false,
        firstLoad: true
    };

    componentDidMount() {
        this.addListeners();
    }

    componentWillUnmount() {
        this.removeListeners();
    }

    addListeners = () => {
        let loadedTopics = [];
        this.state.topicsRef.on("child_added", snap => {
            loadedTopics.push(snap.val());
            this.setState({ topics: loadedTopics }, () => this.setFirstTopic());
            this.addNotificationListener(snap.key);
        });
    };

    addNotificationListener = topicId => {
        this.state.messagesRef.child(topicId).on("value", snap => {
            if (this.state.topic) {
                this.handleNotifications(
                    topicId,
                    this.state.topic.id,
                    this.state.notifications,
                    snap
                );
            }
        });
    };

    handleNotifications = (topicId, isTopicId, notifications, snap) => {
        let lastTotal = 0;
        let index = notifications.findIndex(
            notification => notification.id === topicId
        );
        if (index !== -1) {
            if (topicId !== isTopicId) {
                lastTotal = notifications[index].total;
                if (snap.numChildren() - lastTotal > 0) {
                    notifications[index].count = snap.numChildren() - lastTotal;
                }
            }
            notifications[index].lastKnownTotal = snap.numChildren();
        } else {
            notifications.push({
                id: topicId,
                total: snap.numChildren(),
                lastKnownTotal: snap.numChildren(),
                count: 0
            });
        }
        this.setState({notifications});
    };

    removeListeners = () => {
        this.state.topicsRef.off();
        this.state.topics.forEach(topic => {
            this.state.messagesRef.child(topic.id).off();
        });
    };

    setFirstTopic = () => {
        const firstTopic = this.state.topics[0];
        if (this.state.firstLoad && this.state.topics.length > 0) {
            this.props.setTopic(firstTopic);
            this.setActiveTopic(firstTopic);
            this.setState({topic: firstTopic});
        }
        this.setState({firstLoad: false});
    };

    addTopic = () => {
        const { topicsRef, topicName, topicDetails, user } = this.state;
        const key = topicsRef.push().key;
        const newTopic = {
            id: key,
            name: topicName,
            details: topicDetails,
            createdBy: {
                name: user.displayName,
                avatar: user.photoURL
            }
        };
        topicsRef.child(key).update(newTopic).then(() => {
            this.setState({ topicDetails: "", topicName: "" });
            this.closeModal();
            console.log("Tópico criado.");
        }).catch(err => {
            console.error(err);
        });
    };

    handleSubmit = event => {
        event.preventDefault();
        if (this.isFormValid(this.state)) {
            this.addTopic();
        }
    };

    handleChange = event => {
        this.setState({ [event.target.name]: event.target.value });
    };

    changeTopic = topic => {
        this.setActiveTopic(topic);
        this.state.typingRef
            .child(this.state.topic.id)
            .child(this.state.user.uid)
            .remove();
        this.clearNotifications();
        this.props.setTopic(topic);
        this.props.setPrivateMessage(false);
        this.setState({topic});
    };

    clearNotifications = () => {
        let index = this.state.notifications.findIndex(
            notification => notification.id === this.state.topic.id
        );
        if (index !== -1) {
            let updatedNotifications = [...this.state.notifications];
            updatedNotifications[index].total = this.state.notifications[index].lastKnownTotal;
            updatedNotifications[index].count = 0;
            this.setState({notifications: updatedNotifications});
        }
    };

    setActiveTopic = topic => {
        this.setState({activeTopic: topic.id});
    };

    getNotificationCount = topic => {
        let count = 0;
        this.state.notifications.forEach(notification => {
            if (notification.id === topic.id) {
                count = notification.count;
            }
        });
        if (count > 0) return count;
    };

    displayTopics = topics =>
        topics.length > 0 &&
        topics.map(topic => (
            <Menu.Item
                key={topic.id}
                onClick={() => this.changeTopic(topic)}
                name={topic.name}
                style={{ opacity: 0.7 }}
                active={topic.id === this.state.activeTopic}
                >
                {this.getNotificationCount(topic) && (
                    <Label color="red">{this.getNotificationCount(topic)}</Label>
                )}
                # {topic.name}
            </Menu.Item>
        ));

    isFormValid = ({topicName, topicDetails}) => topicName && topicDetails;

    openModal = (size) => () => this.setState({
        size, modal: true
    });

    closeModal = () => this.setState({
        modal: false
    });

    render() {
        const {topics, modal, size} = this.state;
        return (
            <React.Fragment>
                <Menu.Menu className="menu">
                    <Menu.Item>
                        <span>
                          <Icon name="exchange" /> TODOS OS TÓPICOS
                        </span>{" "}({topics.length})
                        <Icon name="add" onClick={this.openModal('small')} style={{cursor: "Pointer"}}/>
                    </Menu.Item>
                    {this.displayTopics(topics)}
                </Menu.Menu>
                <Modal open={modal} onClose={this.closeModal} size={size}>
                    <Modal.Header>Criar Tópico</Modal.Header>
                    <Modal.Content>
                        <Form onSubmit={this.handleSubmit}>
                            <Form.Field>
                                <Input
                                    fluid
                                    label=" Nome"
                                    name="topicName"
                                    onChange={this.handleChange}
                                />
                            </Form.Field>
                            <Form.Field>
                                <Input
                                    fluid
                                    label="Descrição"
                                    name="topicDetails"
                                    onChange={this.handleChange}
                                />
                            </Form.Field>
                        </Form>
                    </Modal.Content>
                    <Modal.Actions>
                        <Button color="green" onClick={this.handleSubmit}>
                            <Icon name="checkmark" /> CRIAR
                        </Button>
                        <Button color="red" onClick={this.closeModal}>
                            <Icon name="remove" /> CANCELAR
                        </Button>
                    </Modal.Actions>
                </Modal>
            </React.Fragment>
        );
    }
}

export default connect(null, {setTopic, setPrivateMessage})(Topics);
