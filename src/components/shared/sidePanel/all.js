import React from "react";
import {Menu, Flag} from "semantic-ui-react";
import User from "./user";
import Topics from "./topics";
import Favorites from "./topics-favorites";
import DirectMessage from "./direct-message";

class SidePanel extends React.Component {
    render() {
        const {currentUser, sidePanelColor} = this.props;
        return (
            <Menu
                inverted
                fixed="left"
                size="large"
                style={{background: sidePanelColor, fontSize: "1rem"}}
                vertical>
                <User sidePanelColor={sidePanelColor} currentUser={currentUser} />
                <Favorites currentUser={currentUser} />
                <Topics currentUser={currentUser} />
                <DirectMessage currentUser={currentUser} />
                <Flag className="flag-br" name="br" />
                <Flag className="flag-es" name="es" />
                <Flag className="flag-us" name="us" />
            </Menu>
        );
    }
}

export default SidePanel;
