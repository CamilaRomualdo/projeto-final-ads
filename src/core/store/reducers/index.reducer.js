import { combineReducers } from "redux";
import * as actionTypes from "../actions/types.action";

const initialColorState = {
    sidePanelColor: "#4c3c4c",
    backgroundColor: "#eee"
};

const color_reducer = (state = initialColorState, action) => {
    switch (action.type) {
        case actionTypes.SET_COLOR:
            return {
                sidePanelColor: action.payload.sidePanelColor,
                backgroundColor: action.payload.backgroundColor
            };
        default:
            return state;
    }
};

const initialTopicState = {
    isTopic: null,
    isPrivateMessage: false,
    userPosts: null
};

const topic_reducer = (state = initialTopicState, action) => {
    switch (action.type) {
        case actionTypes.SET_TOPIC:
            return {
                ...state,
                isTopic: action.payload.isTopic
            };
        case actionTypes.SET_PRIVATE_MESSAGE:
            return {
                ...state,
                isPrivateMessage: action.payload.isPrivateMessage
            };
        case actionTypes.SET_USER_POSTS:
            return {
                ...state,
                userPosts: action.payload.userPosts
            };
        default:
            return state;
    }
};


const initialUserState = {
    currentUser: null,
    isLoading: true
};

const user_reducer = (state = initialUserState, action) => {
    switch (action.type) {
        case actionTypes.SET_USER:
            return {
                currentUser: action.payload.currentUser,
                isLoading: false
            };
        case actionTypes.CLEAR_USER:
            return {
                ...state,
                isLoading: false
            };
        default:
            return state;
    }
};

const rootReducer = combineReducers({
    color: color_reducer,
    user: user_reducer,
    topic: topic_reducer
});

export default rootReducer;
