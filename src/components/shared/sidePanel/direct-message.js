import React from "react";
import firebase from "../../../core/service/firebase";
import {Icon, Menu} from "semantic-ui-react";
import {connect} from "react-redux";
import {setTopic, setPrivateMessage} from "../../../core/store/actions/index.action";

class DirectMessage extends React.Component {
    state = {
        activeTopic: "",
        connectedRef: firebase.database().ref(".info/connected"),
        user: this.props.currentUser,
        users: [],
        usersRef: firebase.database().ref("usuarios"),
        statusRef: firebase.database().ref("usuariosOnline")
    };

    componentDidMount() {
        if (this.state.user) {
            this.addListeners(this.state.user.uid);
        }
    }

    addListeners = currentUserUid => {
        let loadedUsers = [];
        this.state.usersRef.on("child_added", snap => {
            if (currentUserUid !== snap.key) {
                let user = snap.val();
                user["uid"] = snap.key;
                user["status"] = "offline";
                loadedUsers.push(user);
                this.setState({users: loadedUsers});
            }
        });
        this.state.connectedRef.on("value", snap => {
            if (snap.val() === true) {
                const ref = this.state.statusRef.child(currentUserUid);
                ref.set(true);
                ref.onDisconnect().remove(err => {
                    if (err !== null) {
                        console.error(err);
                    }
                });
            }
        });
        this.state.statusRef.on("child_added", snap => {
            if (currentUserUid !== snap.key) {
                this.addStatusToUser(snap.key);
            }
        });
        this.state.statusRef.on("child_removed", snap => {
            if (currentUserUid !== snap.key) {
                this.addStatusToUser(snap.key, false);
            }
        });
    };

    addStatusToUser = (userId, connected = true) => {
        const updatedUsers = this.state.users.reduce((acc, user) => {
            if (user.uid === userId) {
                user["status"] = `${connected ? "online" : "offline"}`;
            }
            return acc.concat(user);
        }, []);
        this.setState({users: updatedUsers});
    };

    isUserOnline = user => user.status === "online";

    changeTopic = user => {
        const topicId = this.getTopicId(user.uid);
        const topicData = {
            id: topicId,
            name: user.name
        };
        this.props.setTopic(topicData);
        this.props.setPrivateMessage(true);
        this.setActiveTopic(user.uid);
    };

    getTopicId = userId => {
        const currentUserId = this.state.user.uid;
        return userId < currentUserId
            ? `${userId}/${currentUserId}`
            : `${currentUserId}/${userId}`;
    };

    setActiveTopic = userId => {
        this.setState({activeTopic: userId});
    };

    render() {
        const {activeTopic, users} = this.state;
        return (
            <Menu.Menu className="menu">
                <Menu.Item>
                      <span>
                            <Icon name="mail" /> MENSAGENS PRIVADAS
                      </span>{" "}({users.length})
                </Menu.Item>
                {users.map(user => (
                    <Menu.Item
                        active={user.uid === activeTopic}
                        key={user.uid}
                        onClick={() => this.changeTopic(user)}
                        style={{ opacity: 0.7, fontStyle: "italic" }}>
                        <Icon color={this.isUserOnline(user) ? "green" : "red"} name="circle" /> @ {user.name}
                    </Menu.Item>
                ))}
            </Menu.Menu>
        );
    }
}

export default connect(null, {setTopic, setPrivateMessage})(DirectMessage);
