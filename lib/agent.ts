import * as crypto from 'crypto';
import axios from "axios";

export interface AgentCreateOption{
  clientID?: string;
  clientSecretKey?: string;
  gameID: string;
  nhnApiKey: string;
}

export default class NglAgent{
  option: AgentCreateOption;
  url: string;

  constructor(agentCreateOption: AgentCreateOption) {
    this.option = agentCreateOption;
    this.url = `https://apis.naver.com/${this.option.gameID}/`
  }

  async getMemberStatus(login: string){
    const apiEndpoint = this.url + 'gdp/member_getMemberStatus.json';
    return await axios.get(await this.makeHmacUrl(apiEndpoint, this.option.nhnApiKey, login));
  }

  async getAuthCodeUrl(url: string, state: string){
    return `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${this.option.clientID}&redirect_uri=${url}&state=${state}`;
  }

  async makeHmacUrl(url: string, key: string, login: string){
    const now = new Date();
    const param = {
      loginkey: login,
    };
    const hmac = crypto.createHmac(
      'sha1',
      key,
    );

    const paramUrl = url + '?' + (new URLSearchParams(param)).toString();
    const timestamp = Math.floor(now.getTime() / 1000);
    const microtime = now.getMilliseconds();
    const time = timestamp.toString() + microtime.toString().substr(0, 3);

    const hmacUrl = paramUrl + time.toString();

    hmac.update(hmacUrl);

    const digest = hmac.digest('binary');
    const base64 = Buffer.from(digest, 'binary').toString('base64');
    const encoded = encodeURIComponent(base64);

    return `${paramUrl}&msgpad=${time.toString()}&md=${encoded}`;
    // return paramUrl + '&' + 'msgpad=' + time.toString() + '&md=' + encoded;
  }
}
