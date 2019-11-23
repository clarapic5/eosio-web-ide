// To see this in action, run this in a terminal:
//      gp preview $(gp url 8000)

import * as React from "react";
import * as ReactDOM from "react-dom";
import { Api, JsonRpc, RpcError } from 'eosjs';
import { JsSignatureProvider } from 'eosjs/dist/eosjs-jssig';

const rpc = new JsonRpc(''); // nodeos and web server are on same port

interface PostData {
    id?: number;
    user?: string;
    reply_to?: number;
    heart_rate?: number;
    distance?: number;
    speed?: number;
    time?: number;
};

interface PostFormState {
    privateKey: string;
    data: PostData;
    error: string;
};

class PostForm extends React.Component<{}, PostFormState> {
    api: Api;

    constructor(props: {}) {
        super(props);
        this.api = new Api({ rpc, signatureProvider: new JsSignatureProvider([]) });
        this.state = {
            privateKey: '5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3',
            data: {
                id: 0,
                user: 'bob',
                reply_to: 0,
                heart_rate: 255,
                distance: 5,
                speed: 6,
                time:20

            },
            error: '',
        };
    }

    setData(data: PostData) {
        this.setState({ data: { ...this.state.data, ...data } });
    }

    async post() {
        try {
            this.api.signatureProvider = new JsSignatureProvider([this.state.privateKey]);
            const result = await this.api.transact(
                {
                    actions: [{
                        account: 'training',
                        name: 'post',
                        authorization: [{
                            actor: this.state.data.user,
                            permission: 'active',
                        }],
                        data: this.state.data,
                    }]
                }, {
                    blocksBehind: 3,
                    expireSeconds: 30,
                });
            console.log(result);
            this.setState({ error: '' });
        } catch (e) {
            if (e.json)
                this.setState({ error: JSON.stringify(e.json, null, 4) });
            else
                this.setState({ error: '' + e });
        }
    }

    render() {
        return <div>
            <table>
                <tbody>
                    <tr>
                        <td>Private Key</td>
                        <td><input
                            style={{ width: 500 }}
                            value={this.state.privateKey}
                            onChange={e => this.setState({ privateKey: e.target.value })}
                        /></td>
                    </tr>
                    <tr>
                        <td>User</td>
                        <td><input
                            style={{ width: 500 }}
                            value={this.state.data.user}
                            onChange={e => this.setData({ user: e.target.value })}
                        /></td>
                    </tr>
                    <tr>
                        <td>Reply To</td>
                        <td><input
                            style={{ width: 500 }}
                            value={this.state.data.reply_to}
                            onChange={e => this.setData({ reply_to: +e.target.value })}
                        /></td>
                    </tr>
                    <tr>
                        <td>Heart Rate</td>
                        <td><input
                            style={{ width: 500 }}
                            value={this.state.data.heart_rate}
                            onChange={e => this.setData({ heart_rate: +e.target.value })}
                        /></td>
                    </tr>
                     <tr>
                        <td>Distance</td>
                        <td><input
                            style={{ width: 500 }}
                            value={this.state.data.distance}
                            onChange={e => this.setData({ distance: +e.target.value })}
                        /></td>
                    </tr>
                      <tr>
                        <td>Speed</td>
                        <td><input
                            style={{ width: 500 }}
                            value={this.state.data.speed}
                            onChange={e => this.setData({ speed: +e.target.value })}
                        /></td>
                    </tr>
                     <tr>
                        <td>Time</td>
                        <td><input
                            style={{ width: 500 }}
                            value={this.state.data.time}
                            onChange={e => this.setData({ time: +e.target.value })}
                        /></td>
                    </tr>
                </tbody>
            </table>
            <br />
            <button onClick={e => this.post()}>Post</button>
            {this.state.error && <div>
                <br />
                Error:
                <code><pre>{this.state.error}</pre></code>
            </div>}
        </div>;
    }
}

class Activities extends React.Component<{}, { heart_rate: number, distance: number, speed: number, time: number }> {
    interval: number;

    constructor(props: {}) {
        super(props);
        this.state = { 
            heart_rate: 0,
            distance: 0,
            speed: 0,
            time: 0
        };
    }
}