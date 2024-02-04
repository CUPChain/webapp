import React from 'react';
import { Icon } from 'design-react-kit';

type Type = "success" | "warning" | "error" | "info";

const Notification = ({ type, text }: { type: Type, text: string }) => {
    return (
        <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            textAlign: "center",
            borderLeft: "3px solid",
            borderColor: type === "success" ? "#4CAF50" :
                type === "warning" ? "#FFC107" :
                    type === "error" ? "#F44336" :
                        "#007BFF",
        }}>
            {
                type === "success" ? <Icon icon="it-check-circle" color="success" /> :
                    type === "warning" ? <Icon icon="it-warning-circle" color="warning" /> :
                        type === "error" ? <Icon icon="it-error-circle" color="danger" /> :
                            <Icon icon="it-info-circle" color="primary" />
            }
            {text}
        </div>
    )
}

export default Notification;