import * as actionTypes from "./types.action";

export const setUser = user => {
    return {
        type: actionTypes.SET_USER,
        payload: {
            currentUser: user
        }
    };
};

export const clearUser = () => {
    return {
        type: actionTypes.CLEAR_USER
    };
};

export const setTopic = topic => {
    return {
        type: actionTypes.SET_TOPIC,
        payload: {
            isTopic: topic
        }
    };
};

export const setPrivateMessage = isPrivateMessage => {
    return {
        type: actionTypes.SET_PRIVATE_MESSAGE,
        payload: {
            isPrivateMessage
        }
    };
};

export const setUserPosts = userPosts => {
    return {
        type: actionTypes.SET_USER_POSTS,
        payload: {
            userPosts
        }
    };
};

export const setColor = (sidePanelColor, backgroundColor) => {
    return {
        type: actionTypes.SET_COLOR,
        payload: {
            sidePanelColor,
            backgroundColor
        }
    };
};
