import React, { useState } from "react";
import axios from "axios";
import { Rnd } from "react-rnd";
import yaml from "js-yaml";

const defaultAccount = {
    user_id: "",
    cash: "",
    shares: ""
};

// hints
const placeholderMap: { [key: string]: string } = {
    user_id: "User ID",
    cash: "Initial Cash (e.g. 10000)",
    shares: "Shares (YAML or JSON, optional, multi-line supported)"
};

const AccountModule: React.FC = () => {
    const [account, setAccount] = useState(defaultAccount);

    // update account
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setAccount({ ...account, [e.target.name]: e.target.value });
    };

    // validate whether the shares field is in YAML/JSON format
    const parseShares = (input: string): any => {
        if (!input.trim()) return {};
        let result;
        try {
            result = yaml.load(input);
        } catch {
            try {
                result = JSON.parse(input);
            } catch {
                throw new Error("Shares must be valid YAML or JSON.");
            }
        }
        // only object types are allowed (and not arrays)
        if (typeof result !== 'object' || result === null || Array.isArray(result)) {
            throw new Error("Shares must be a YAML/JSON object (e.g. {AAPL: 10, TSLA: 5})");
        }
        return result;
    };

    // submit account
    const handleSubmit = async () => {
        if (account.user_id.trim() === "") {
            alert("Please fill in the User ID before submitting.");
            return;
        }
        if (account.cash.trim() === "") {
            alert("Please enter a cash value.");
            return;
        }
        if (isNaN(Number(account.cash))) {
            alert("Cash must be a valid number.");
            return;
        }
        let sharesValue = {};
        if (account.shares.trim() !== "") {
            try {
                sharesValue = parseShares(account.shares);
            } catch (err: any) {
                alert(err.message);
                return;
            }
        }
        try {
            await axios.post("http://localhost:8080/api/account", {
                user_id: account.user_id,
                cash: parseFloat(account.cash),
                shares: sharesValue
            });
            setAccount(defaultAccount);
            alert("Account Submitted Successfully");
        } catch (e: any) {
            alert("Submission Failed: " + (e?.response?.data?.error || e.message));
        }
    };

    // delete account
    const handleDelete = async () => {
        if (!account.user_id) {
            alert("Please fill the User ID to delete.");
            return;
        }
        try {
            await axios.delete(`http://localhost:8080/api/account/${account.user_id}`);
            alert(`Account ${account.user_id} Deleted`);
            setAccount(defaultAccount);
        } catch (e) {
            alert("Deletion Failed or User Non-existent");
        }
    };

    return (
        <Rnd
            default={{
                x: 960,
                y: -120,
                width: 400,
                height: 320,
            }}
            minWidth={300}
            minHeight={180}
            bounds="window"
            dragHandleClassName="drag-handle-account"
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
                    className="drag-handle-account"
                    style={{
                        cursor: "move",
                        backgroundColor: "#424242",
                        color: "white",
                        padding: "8px 16px",
                        userSelect: "none",
                        fontWeight: "bold",
                    }}
                >
                    Account Input （drag here to move）
                </div>

                <div style={{ padding: 16, flex: 1, backgroundColor: "#f0f0f0" }}>
                    <form style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {Object.keys(defaultAccount).map(key => (
                            key === "shares" ? (
                                <textarea
                                    key={key}
                                    name={key}
                                    value={account[key as keyof typeof account]}
                                    placeholder={placeholderMap[key] || key}
                                    onChange={handleChange}
                                    rows={3}
                                    style={{
                                        color: "black",
                                        padding: 8,
                                        borderRadius: 4,
                                        border: "1px solid #ccc",
                                        backgroundColor: "#fff",
                                        resize: "vertical",
                                        fontFamily: "monospace",
                                    }}
                                />
                            ) : (
                                <input
                                    key={key}
                                    name={key}
                                    value={account[key as keyof typeof account]}
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
                            )
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
                            Submit Account
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
                            Delete Account (Only User ID Needed)
                        </button>
                    </form>
                </div>
            </div>
        </Rnd>
    );
};

export default AccountModule;