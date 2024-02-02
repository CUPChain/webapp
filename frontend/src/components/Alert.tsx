import React, { createContext, useContext, useState } from 'react';
import { Alert, AlertProps } from "design-react-kit";

type Message = {
    text: string;
    type: AlertProps["color"];
};

// AlertBox component to display messages
const AlertBox = ({ messages }: { messages: Message[]; }) => {
    return (
        <div style={{
            position: 'absolute',
            top: 120,
            right: 0,
            width: '40rem'
        }}>
            {messages.map((message, index) => (
                <Alert key={index} color={message.type}>
                    <span>{message.text}</span>
                </Alert>
            ))}
        </div>
    );
};


// Create a context for managing alerts
const AlertContext = createContext<{
    messages: Message[];
    addMessage: (message: Message) => void;
}>({
    messages: [],
    addMessage: () => { }
});

// Custom hook to use the alert context
export const useAlert = () => useContext(AlertContext);

// Provider component to manage alerts
export const AlertProvider = ({ children }: { children: React.ReactNode; }) => {
    const [messages, setMessages] = useState<Message[]>([]);

    // Function to add a new message
    const addMessage = ({ text, type }: Message) => {
        setMessages(prev => [...prev, { text, type }]);
        // Remove message after 5 seconds
        setTimeout(() => {
            setMessages(prev => prev.slice(1));
        }, 5000);
    };

    return (
        <AlertContext.Provider value={{ messages, addMessage }}>
            {children}
            <AlertBox messages={messages} />
        </AlertContext.Provider>
    );
};
