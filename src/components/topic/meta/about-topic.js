import React from "react";
import {Accordion, Divider, Icon, Image, Header, List, Segment} from "semantic-ui-react";

class Meta extends React.Component {
    state = {
        activeIndex: 0,
        privateMessage: this.props.isPrivateMessage,
        topic: this.props.isTopic
    };

    setActiveIndex = (event, titleProps) => {
        const {index} = titleProps;
        const {activeIndex} = this.state;
        const newIndex = activeIndex === index ? -1 : index;
        this.setState({ activeIndex: newIndex });
    };

    formatCount = num => (num > 1 || num === 0 ? `${num} posts` : `${num} post`);

    displayTopPosters = posts =>
        Object.entries(posts).sort((a, b) => b[1] - a[1])
            .map(([key, val], i) => (
                <List.Item key={i}>
                    <Image avatar src={val.avatar} />
                    <List.Content>
                        <List.Header as="a">{key}</List.Header>
                        <List.Description>{this.formatCount(val.count)}</List.Description>
                    </List.Content>
                </List.Item>
            )).slice(0, 2);

    render() {
        const {activeIndex, privateMessage, topic} = this.state;
        const {userPosts} = this.props;
        if (privateMessage) return null;
        return (
            <Segment loading={!topic} style={{height: '35.1em'}}>
                <Header as="h3" attached="top" textAlign={"center"}>
                    Sobre o Tópico # {topic && topic.name}
                </Header>
                <Accordion styled>
                    <Accordion.Title
                        active={activeIndex === 0}
                        index={0}
                        onClick={this.setActiveIndex}>
                        <Icon name="dropdown" />
                        <Icon name="info circle" />
                        Descrição
                    </Accordion.Title>
                    <Accordion.Content active={activeIndex === 0}>
                        {topic && topic.details}
                    </Accordion.Content>
                    <Accordion.Title
                        active={activeIndex === 1}
                        index={1}
                        onClick={this.setActiveIndex}>
                        <Icon name="dropdown" />
                        <Icon name="user circle" />
                        Estatísticas
                    </Accordion.Title>
                    <Accordion.Content active={activeIndex === 1}>
                        <List divided relaxed>
                            {userPosts && this.displayTopPosters(userPosts)}
                        </List>
                    </Accordion.Content>
                    <Accordion.Title
                        active={activeIndex === 2}
                        index={2}
                        onClick={this.setActiveIndex}>
                        <Icon name="dropdown" />
                        <Icon name="copyright" />
                        Criador do Tópico
                    </Accordion.Title>
                    <Accordion.Content active={activeIndex === 2}>
                        <Header as="h3" textAlign={"center"}>
                            <Image circular src={topic && topic.createdBy.avatar} />
                            {topic && topic.createdBy.name}
                        </Header>
                    </Accordion.Content>
                </Accordion>
                <Divider />
            </Segment>
        );
    }
}

export default Meta;
