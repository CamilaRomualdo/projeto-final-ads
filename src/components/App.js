import React from "react";
import "./App.css";

import MediaQuery from 'react-responsive';
import {Grid} from "semantic-ui-react";

// Components
import SidebarMenu from "./shared/sidebar-menu";
import SidePanel from "./shared/sidePanel/all";
import Topics  from "./topic/all";
import Meta from "./topic/meta/about-topic";

// Redux
import {connect} from "react-redux";

const App = ({currentUser, isTopic, isPrivateMessage, sidePanelColor, userPosts}) => (
    <MediaQuery device={{deviceWidth: 1600}} minDeviceWidth={1224}>
        <Grid className="app" columns="equal" style={{paddingTop: '1em'}}>
            <SidebarMenu
                key={currentUser && currentUser.name}
                currentUser={currentUser}
            />
            <SidePanel
                key={currentUser && currentUser.uid}
                currentUser={currentUser}
                sidePanelColor={sidePanelColor}
            />
            <Grid.Column style={{paddingLeft: '23.3em', width: '30.9em'}}>
                <Topics
                    key={isTopic && isTopic.id}
                    isTopic={isTopic}
                    currentUser={currentUser}
                    isPrivateMessage={isPrivateMessage}
                />
            </Grid.Column>
            <Grid.Column style={{width: '8.2em'}} verticalAlign='top'>
                <Meta
                    key={isTopic && isTopic.name}
                    userPosts={userPosts}
                    isTopic={isTopic}
                    isPrivateMessage={isPrivateMessage}
                />
            </Grid.Column>
        </Grid>
    </MediaQuery>
);

const mapStateToProps = state => ({
    isTopic: state.topic.isTopic,
    currentUser: state.user.currentUser,
    isPrivateMessage: state.topic.isPrivateMessage,
    userPosts: state.topic.userPosts,
    sidePanelColor: state.color.sidePanelColor
});

export default connect(mapStateToProps)(App);
