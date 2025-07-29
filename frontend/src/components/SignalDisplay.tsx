import React, { useState } from "react";

import axios from "axios";
import { Rnd } from "react-rnd";

const defaultSignal = {
    id: "",
    symbol: "",
    value: "",
    timestamp: "",
    source: "",
    comment: ""
};

// a placeholder hint for each field
const placeholderMap: { [key: string]: string } = {
    id: "Signal ID",
    symbol: "Ticker Symbol",
    value: "Signal Value",
    timestamp: "Timestamp (e.g., 2034-09-29T13:45)",
    source: "Signal Source",
    comment: "Some Comment",
};

const SignalDisplay: React.FC = () => {
    // use state to store signal being edited
    const [signal, setSignal] = useState(defaultSignal);

    // update signal state on input change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSignal({ ...signal, [e.target.name]: e.target.value });
    };

    // handle submit to save signal via API
    const handleSubmit = async () => {
        // check if fill signal id first
        if (signal.id.trim() === "") {
            alert("Please fill in the Signal ID before submitting.");
            return;
        }
        // submitting
        try {
            await axios.post("http://localhost:8080/api/signal", signal);
            setSignal(defaultSignal);
            alert("Submission Successful");
        } catch (e) {
            alert("Submission Failed");
        }
    };

    // delete signal by id
    const handleDelete = async () => {
        if (!signal.id) {
            alert("Please fill in the signal ID that needs to be deleted.");
            return;
        }
        try {
            await axios.delete(`http://localhost:8080/api/signal/${signal.id}`);
            alert(`Signal ${signal.id} Deleted`);
            setSignal(defaultSignal);
        } catch (e) {
            alert("Deletion Failed or Signal Non-existent");
        }
    };

    // Rnd enclosure
    return (
        <Rnd
            default={{
                x: 100,
                y: 260,
                width: 400,
                height: 420,
            }}
            minWidth={300}
            minHeight={200}
            bounds="window"
            dragHandleClassName="drag-handle"
        >
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                    border: "1px solid #ddd",
                    borderRadius: 4,
                    background: "#fff",
                    overflow: "hidden",
                }}
            >
                <div
                    className="drag-handle"
                    style={{
                        cursor: "move",
                        backgroundColor: "#FFA500",
                        color: "white",
                        padding: "8px 16px",
                        userSelect: "none",
                        fontWeight: "bold",
                    }}
                >
                    Signal Input （drag this area to move）
                </div>

                <div style={{ padding: 16, flex: 1, backgroundColor: "#f0f0f0" }}>
                    <form style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {Object.keys(defaultSignal).map(key => (
                            <input
                                key={key}
                                name={key}
                                value={signal[key as keyof typeof signal]}
                                placeholder={placeholderMap[key] || key}
                                onChange={handleChange}
                                style={{
                                    color: "black",
                                    padding: 8,
                                    borderRadius: 4,
                                    border: "1px solid #ccc",
                                    backgroundColor: "#fff",
                                }}
                            />
                        ))}
                        <button
                            type="button"
                            onClick={handleSubmit}
                            style={{
                                padding: 8,
                                background: "#008000",
                                color: "#fff",
                                borderRadius: 4,
                                border: "none",
                                fontWeight: "bold",
                                marginTop: 8,
                            }}
                        >
                            Submit Signal
                        </button>
                        <button
                            type="button"
                            onClick={handleDelete}
                            style={{
                                padding: 8,
                                background: "#d32f2f",
                                color: "#fff",
                                borderRadius: 4,
                                border: "none",
                                fontWeight: "bold",
                                marginTop: 8,
                            }}
                        >
                            Delete Signal (Only ID Needed)
                        </button>
                    </form>
                </div>
            </div>
        </Rnd>
    );
};

export default SignalDisplay;
