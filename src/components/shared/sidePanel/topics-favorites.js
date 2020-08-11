import React from "react";
import firebase from "../../../core/service/firebase";
import {Icon, Menu} from "semantic-ui-react";
import {connect} from "react-redux";
import {setTopic, setPrivateMessage} from "../../../core/store/actions/index.action";

class Favorites extends React.Component {

    state = {
        user: this.props.currentUser,
        usersRef: firebase.database().ref("usuarios"),
        activeTopic: "",
        favoriteTopics: [],
    };

    componentDidMount() {
        if (this.state.user) {
            this.addListeners(this.state.user.uid);
        }
    }

    componentWillUnmount() {
        this.removeListener();
    }

    removeListener = () => {
        this.state.usersRef
            .child(`${this.state.user.uid}/topicosFavorito`).off();
    };

    addListeners = userId => {
        this.state.usersRef
            .child(userId)
            .child("topicosFavorito")
            .on("child_added", snap => {
                const favoriteTopic = {
                    id: snap.key, ...snap.val()
                };
                this.setState({
                    favoriteTopics: [...this.state.favoriteTopics, favoriteTopic]
                });
        });
        this.state.usersRef
            .child(userId)
            .child("topicosFavorito")
            .on("child_removed", snap => {
                const topicToRemove = {
                    id: snap.key, ...snap.val()
                };
                const filteredTopics = this.state.favoriteTopics.filter(topic => {
                    return topic.id !== topicToRemove.id;
                });
                this.setState({ favoriteTopics: filteredTopics });
            });
    };

    setActiveTopic = topic => {
        this.setState({ activeTopic: topic.id });
    };

    changeTopic = topic => {
        this.setActiveTopic(topic);
        this.props.setTopic(topic);
        this.props.setPrivateMessage(false);
    };

    displayTopics = favoriteTopics =>
        favoriteTopics.length > 0 &&
        favoriteTopics.map(topic => (
            <Menu.Item
                key={topic.id}
                onClick={() => this.changeTopic(topic)}
                name={topic.name}
                style={{opacity: 0.7}}
                active={topic.id === this.state.activeTopic}
            >
                # {topic.name}
            </Menu.Item>
        ));

    render() {
        const {favoriteTopics} = this.state;
        return (
            <Menu.Menu className="menu">
                <Menu.Item>
                    <span>
                        <Icon name="star" /> FAVORITOS
                    </span>{" "}
                    ({favoriteTopics.length})
                </Menu.Item>
                {this.displayTopics(favoriteTopics)}
            </Menu.Menu>
        );
    }
}

export default connect(null, {setTopic, setPrivateMessage})(Favorites);
