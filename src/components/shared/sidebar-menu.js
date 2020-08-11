import React from "react";
import {Button, Header, Icon, Menu, Modal, Popup, Sidebar} from "semantic-ui-react";

class SidebarMenu extends React.Component {
    state = {
        open: false
    };

    handleClose = () => this.setState({
        open: false
    });

    handleOpen = (dimmer) => () => this.setState({
        dimmer, open: true
    });

    render() {
        const {dimmer, open} = this.state;
        return (
            <Sidebar as={Menu} color="yellow" icon="labeled" inverted vertical visible width="very thin">
                <Popup content="Início" position="top right" trigger={
                    <Button
                        basic
                        circular
                        color="black"
                        icon="at"
                        size="small"
                        style={{marginTop: "2em"}}
                    />
                }/>
                <Popup content="Sobre" position="top right" trigger={
                    <Button
                        basic
                        circular
                        color="black"
                        disabled={open}
                        icon="archive"
                        onClick={this.handleOpen("blurring")}
                        size="small"
                        style={{marginTop: "1.3em"}}
                    />
                }/>
                <Popup content="Suporte" position="top right" trigger={
                    <Button
                        basic
                        circular
                        color="black"
                        icon="envelope open outline"
                        size="small"
                        style={{marginTop: "1.3em"}}
                        disabled={open}
                        onClick={this.handleOpen("blurring")}
                    />
                }/>
                <Modal dimmer={dimmer} onClose={this.close} open={open}>
                    <Modal.Header><Icon name="attention" size={"large"}></Icon>ATENÇÃO</Modal.Header>
                    <Modal.Content image>
                        <Modal.Description>
                            <Header>PÁGINA EM DESENVOLVIMENTO</Header>
                            <p>
                                Esta página encontra-se em desenvolvimento no momento,
                                <br/>
                                Pedimos a sua compreensão.
                            </p>
                            <p>Obrigado, equipe Geekat.</p>
                        </Modal.Description>
                    </Modal.Content>
                    <Modal.Actions>
                        <Button
                            content="FECHAR"
                            icon="checkmark"
                            labelPosition="right"
                            negative
                            onClick={this.handleClose}
                        />
                    </Modal.Actions>
                </Modal>
            </Sidebar>
        );
    }
}

export default SidebarMenu;
