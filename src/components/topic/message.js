import React from "react";
import moment from "moment";
import {Comment, Image} from "semantic-ui-react";

const isOwnMessage = (message, user) => {
    return message.user.id === user.uid ? "messageSelf" : "";
};

const isImage = message => {
    return message.hasOwnProperty("image") && !message.hasOwnProperty("content");
};

const timeFromNow = timestamp => moment(timestamp).fromNow();

const Message = ({message, user}) => (
    <Comment.Group size='small'>
        <Comment>
            <Comment.Avatar src={message.user.avatar}/>
            <Comment.Content className={isOwnMessage(message, user)}>
                <Comment.Author as="a">{message.user.name}</Comment.Author>
                <Comment.Metadata>{timeFromNow(message.timestamp)}</Comment.Metadata>
                {isImage(message) ? (
                    <Image src={message.image} className="messageImage"/>
                ) : (
                    <Comment.Text>{message.content}</Comment.Text>
                )}
            </Comment.Content>
        </Comment>
    </Comment.Group>
);

export default Message;
