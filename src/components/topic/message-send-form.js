import React from "react";
import {v4 as uuidv4} from 'uuid';
import firebase from "../../core/service/firebase";
import {Button, Input, Segment} from "semantic-ui-react";
import {emojiIndex, Picker} from "emoji-mart";
import "emoji-mart/css/emoji-mart.css";
import MediaUpload from "./media-upload";
import ProgressBar from "./progress-bar";

class MessageSendForm extends React.Component {
    state = {
        emojiPicker: false,
        errors: [],
        loading: false,
        message: "",
        modal: false,
        percentUploaded: 0,
        storageRef: firebase.storage().ref(),
        topic: this.props.isTopic,
        typingRef: firebase.database().ref("digitando"),
        uploadState: "",
        uploadTask: null,
        user: this.props.currentUser,
    };

    componentWillUnmount() {
        if (this.state.uploadTask !== null) {
            this.state.uploadTask.cancel();
            this.setState({uploadTask: null});
        }
    }

    openModal = () => this.setState({
        modal: true
    });

    closeModal = () => this.setState({
        modal: false
    });

    handleChange = event => {
        this.setState({[event.target.name]: event.target.value});
    };

    handleKeyDown = event => {
        if (event.ctrlKey && event.keyCode === 13) {
            this.sendMessage();
        }
        const {message, topic, typingRef, user} = this.state;
        if (message) {
            typingRef.child(topic.id).child(user.uid).set(user.displayName);
        } else {
            typingRef.child(topic.id).child(user.uid).remove();
        }
    };

    handleTogglePicker = () => {
        this.setState({emojiPicker: !this.state.emojiPicker});
    };

    handleAddEmoji = emoji => {
        const oldMessage = this.state.message;
        const newMessage = this.colonToUnicode(` ${oldMessage} ${emoji.colons} `);
        this.setState({message: newMessage, emojiPicker: false});
        setTimeout(() => this.messageInputRef.focus(), 0);
    };

    colonToUnicode = message => {
        return message.replace(/:[A-Za-z0-9_+-]+:/g, x => {
            x = x.replace(/:/g, "");
            let emoji = emojiIndex.emojis[x];
            if (typeof emoji !== "undefined") {
                let unicode = emoji.native;
                if (typeof unicode !== "undefined") {
                    return unicode;
                }
            }
            x = ":" + x + ":";
            return x;
        });
    };

    createMessage = (fileUrl = null) => {
        const message = {
            timestamp: firebase.database.ServerValue.TIMESTAMP,
            user: {
                id: this.state.user.uid,
                name: this.state.user.displayName,
                avatar: this.state.user.photoURL
            }
        };
        if (fileUrl !== null) {
            message["image"] = fileUrl;
        } else {
            message["content"] = this.state.message;
        }
        return message;
    };

    sendMessage = () => {
        const {getMessagesRef} = this.props;
        const {message, topic, typingRef, user} = this.state;
        if (message) {
            this.setState({loading: true});
            getMessagesRef().child(topic.id).push().set(this.createMessage()).then(() => {
                this.setState({loading: false, message: "", errors: []});
                typingRef.child(topic.id).child(user.uid).remove();
            }).catch(err => {
                console.error(err);
                this.setState({
                    loading: false,
                    errors: this.state.errors.concat(err)
                });
            });
        } else {
            this.setState({
                errors: this.state.errors.concat({message: "Mensagem adicionada."})
            });
        }
    };

    getPath = () => {
        if (this.props.isPrivateMessage) {
            return `imagens/mensagensPrivada-${this.state.topic.id}`;
        } else {
            return "imagens/topico";
        }
    };

    uploadFile = (file, metadata) => {
        const pathToUpload = this.state.topic.id;
        const ref = this.props.getMessagesRef();
        const filePath = `${this.getPath()}/${uuidv4()}.jpg`;
        this.setState({
                uploadState: "uploading",
                uploadTask: this.state.storageRef.child(filePath).put(file, metadata)
            }, () => {
                this.state.uploadTask.on("state_changed", snap => {
                        const percentUploaded = Math.round(
                            (snap.bytesTransferred / snap.totalBytes) * 100
                        );
                        this.setState({percentUploaded});
                    }, err => {
                        console.error(err);
                        this.setState({
                            errors: this.state.errors.concat(err),
                            uploadState: "error",
                            uploadTask: null
                        });
                    }, () => {
                        this.state.uploadTask.snapshot.ref.getDownloadURL().then(downloadUrl => {
                            this.sendFileMessage(downloadUrl, ref, pathToUpload);
                        }).catch(err => {
                            console.error(err);
                            this.setState({
                                errors: this.state.errors.concat(err),
                                uploadState: "error",
                                uploadTask: null
                            });
                        });
                    }
                );
            }
        );
    };

    sendFileMessage = (fileUrl, ref, pathToUpload) => {
        ref
            .child(pathToUpload)
            .push()
            .set(this.createMessage(fileUrl))
            .then(() => {
                this.setState({uploadState: "done"});
            })
            .catch(err => {
                console.error(err);
                this.setState({
                    errors: this.state.errors.concat(err)
                });
            });
    };

    render() {
        const {emojiPicker, errors, loading, message, modal, percentUploaded, uploadState} = this.state;
        return (
            <Segment className="messageForm">
                {emojiPicker && (
                    <Picker
                        emoji="point_up"
                        onSelect={this.handleAddEmoji}
                        set="apple"
                        style={{position: 'absolute', bottom: '90px'}}
                        title="Escolha um emoji!"
                    />
                )}
                <Input
                    className={
                        errors.some(error => error.message.includes("message"))
                            ? "error"
                            : ""
                    }
                    fluid
                    name="message"
                    label={
                        <Button
                            icon={emojiPicker ? "close" : "add"}
                            content={emojiPicker ? "Fechar" : null}
                            onClick={this.handleTogglePicker}
                        />
                    }
                    labelPosition="left"
                    onChange={this.handleChange}
                    onKeyDown={this.handleKeyDown}
                    placeholder="Escreva sua mensagem aqui..."
                    value={message}
                    ref={node => (this.messageInputRef = node)}
                    style={{marginBottom: "0.7em"}}
                />
                <Button.Group icon widths="2">
                    <Button
                        color="orange"
                        content="Postar"
                        disabled={loading}
                        icon="paper plane outline"
                        labelPosition="left"
                        onClick={this.sendMessage}

                    />
                    <Button
                        color="teal"
                        content="Enviar Imagem"
                        disabled={uploadState === "uploading"}
                        icon="upload"
                        labelPosition="right"
                        onClick={this.openModal}
                    />
                </Button.Group>
                <MediaUpload
                    closeModal={this.closeModal}
                    modal={modal}
                    uploadFile={this.uploadFile}
                />
                <ProgressBar
                    percentUploaded={percentUploaded}
                    uploadState={uploadState}
                />
            </Segment>
        );
    }
}

export default MessageSendForm;
