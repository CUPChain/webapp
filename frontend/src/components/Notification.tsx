import React from 'react';
import { Icon } from 'design-react-kit';

type Type = "success" | "warning" | "error" | "info";

/** This component is a notification with a title, a type and a text. **/
const Notification = ({ type, text }: { type: Type, text: string; }) => {
    return (
        <div
            className={"notification with-icon " + type}
            style={{
                borderTop: "none",
                borderBottom: "none",
                borderRight: "none",
                display: "block"
            }}
        >
            <Icon
                icon={
                    type === "success" ? "it-check-circle" :
                        type === "warning" ? "it-warning-circle" :
                            type === "error" ? "it-error-circle" : "it-info-circle"
                }
                color={type}
            />
            {text}
        </div>
    );
};

export default Notification;