import React, { useState } from "react";
import axios from "axios";
import { Rnd } from "react-rnd";
import yaml from "js-yaml";

// 默认账户结构
const defaultAccount = {
    user_id: "",
    cash: "",
    shares: ""
};

// 每个字段的占位提示
const placeholderMap: { [key: string]: string } = {
    user_id: "User ID",
    cash: "Initial Cash (e.g. 10000)",
    shares: "Shares (YAML or JSON, optional)"
};

const AccountModule: React.FC = () => {
    const [account, setAccount] = useState(defaultAccount);

    // 输入变更时更新账户状态
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAccount({ ...account, [e.target.name]: e.target.value });
    };

    // 将 shares 字段解析为对象（优先尝试 YAML，失败后尝试 JSON）
    const parseShares = (input: string): any => {
        if (!input.trim()) return {};
        try {
            return yaml.load(input);
        } catch {
            try {
                return JSON.parse(input);
            } catch {
                throw new Error("Shares must be valid YAML or JSON.");
            }
        }
    };

    // 提交账户信息
    const handleSubmit = async () => {
        if (account.user_id.trim() === "") {
            alert("Please fill in the User ID before submitting.");
            return;
        }
        if (account.cash.trim() === "" || isNaN(Number(account.cash))) {
            alert("Please enter a valid cash value.");
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
        } catch (e) {
            alert("Submission Failed");
        }
    };

    // 删除账户
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