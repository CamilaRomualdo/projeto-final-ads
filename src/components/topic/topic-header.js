import React from "react";
import MediaQuery from "react-responsive"
import {Icon, Input, Header, Segment} from "semantic-ui-react";

class TopicHeader extends React.Component {
    render() {
        const {topicName, numUniqueUsers, handleSearchChange, searchLoading,
            isPrivateMessage, handleStar, isFavoriteTopic} = this.props;
        return (
            <MediaQuery device={{deviceWidth: 1600}} minDeviceWidth={1224}>
                <Segment>
                    <Header>
                        <span>
                            {!isPrivateMessage && (
                                <Icon
                                    onClick={handleStar}
                                    name={isFavoriteTopic ? "star" : "star outline"}
                                    color={isFavoriteTopic ? "yellow" : "black"}
                                    style={{padding: "0.1em", cursor: "Pointer"}}
                                />
                            )}
                            {topicName}
                        </span>
                        <Header.Subheader style={{paddingLeft: "0.4em", paddingTop: "1.5em"}}>
                            <Icon color="teal" name="users"/>
                            {numUniqueUsers} presente.
                        </Header.Subheader>
                    </Header>
                    <Header>
                        <Input
                            focus
                            icon="search"
                            name="searchTerm"
                            loading={searchLoading}
                            onChange={handleSearchChange}
                            placeholder="Buscar por mensagem..."
                            size="mini"
                        />
                    </Header>
                </Segment>
            </MediaQuery>
        );
    }
}

export default TopicHeader;
