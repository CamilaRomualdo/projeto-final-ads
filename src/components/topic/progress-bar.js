import React from "react";
import {Progress} from "semantic-ui-react";

const ProgressBar = ({percentUploaded, uploadState}) =>
    uploadState === "uploading" && (
        <Progress
            className="progressBar"
            indicating
            inverted
            percent={percentUploaded}
            progress
            size="medium"
        />
    );

export default ProgressBar;
