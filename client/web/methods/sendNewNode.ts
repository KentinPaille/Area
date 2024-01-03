import { NodeProps } from "../interfaces/nodes";

const sendNewNode = async (node: NodeProps) => {
    console.log("Sending new node to server: ", node);
    const response = await fetch("http://localhost:8080/client/new-node", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(node),
    });

    const data = await response.json();

    console.log(data);
};

export default sendNewNode;
