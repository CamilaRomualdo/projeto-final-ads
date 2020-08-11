import React from "react";
import {Dimmer, Loader} from "semantic-ui-react";

const Loading = () => (
    <Dimmer active inverted>
        <Loader content={"Preparando ambiente..."} inline='centered' size="massive"/>
    </Dimmer>
);

export default Loading;
