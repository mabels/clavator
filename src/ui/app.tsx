import * as React from 'react';
import './normalize.css';
import './skeleton.css';
import './app.less';
import 'font-awesome/less/font-awesome.less';

import * as classnames from 'classnames';
// import "react-font-awesome";

// import "./clavator.png";
const Clavator = require('./clavator.png');

import { KeyChainList } from './key-chain-list';
import { CardStatusList } from './card-status-list';
import { CreateKey } from './create-key';
import { ResetYubikey } from './reset-yubikey';
import { Progressor } from './progressor';
import { ChannelStatus } from './channel-status';

import * as WsChannel from './ws-channel';

interface AppState {
  channel: WsChannel.Dispatch;
}

export class App extends React.Component<{}, AppState> {

  public static childContextTypes = {
   socket: React.PropTypes.object
  };


  // getChildContext() {
  //   return { channel: this.state.socket };
  // }

  constructor() {
    super();
    // let sk : ListSecretKeys.SecretKey[] = [];
    this.state = {
      channel: null
    };
  }


  protected componentDidMount(): void {
    this.setState(Object.assign({}, this.state, { channel: WsChannel.create() }));
  }

  protected componentWillUnmount(): void {
    this.state.channel.close();
    this.setState(Object.assign({}, this.state, { channel: null }));
  }

  // componentWillReceiveProps(nextProps: any, nextContext: any) {
  //   debugger
  // }

  // shouldComponentUpdate(nextProps: any,  nextState: any,  nextContext: any) : boolean {
  //   debugger
  //   return true;
  // }

  // componentWillUpdate(nextProps: any, nextState: any, nextContext: any) {
  //   debugger
  // }

  // componentDidUpdate(prevProps: any, prevState: any, prevContext: any) {
  //   debugger
  // }

  public render_xxx() : JSX.Element {
    return (
      <div className="app container">
          <div className="left-top">
            <img src={Clavator} width="128px" title="Clavator"/>
          </div>
          <div className="left-bottom">
            <ResetYubikey channel={this.state.channel} />
            <ChannelStatus channel={this.state.channel} />
          </div>
          <div className="middle-bottom">
              <Progressor channel={this.state.channel} msg="Clavator"/>
          </div>

          <div className="row">
              <CreateKey channel={this.state.channel} />
          </div>
          <div className="row">
            <div className="three column"></div>
            <div className="nine column">
              <KeyChainList channel={this.state.channel} />
            </div>
          </div>
          <div className="row">
            <div className="three column"></div>
            <div className="nine column">
              <CardStatusList channel={this.state.channel} />
            </div>
          </div>
          <div className="row">
            <div className="twelve column"></div>
          </div>
      </div>

    )
    //
    // <h1>Pure CSS Off-Screen Menu</h1>
    // <h3>Finally, an off-screen menu that doesn't require a bunch of Javascript to work. </h3>
    //
    // <p>This concept relies on the <code>:checked</code> pseudo-selector as well as the general sibling <code>~</code> selector, so it has decent browser support.</p>
    // <p><strong>Browsers supported:</strong> IE9+, Firefox 3.5+, Chrome any, Safari 3.2+, Opera 9.5+</p>
    // <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quasi vero nisi eos sed qui natus, ut eius reprehenderit error nesciunt veniam aliquam nulla itaque labore obcaecati molestiae eveniet, perferendis provident amet perspiciatis expedita accusantium! Eveniet, quos voluptas et, labore natus, saepe unde est nulla sit eaque tempore debitis accusantium. Recusandae.</p>
    // <p>Dolorem aliquam a libero reiciendis obcaecati doloribus ipsa eos laudantium, dicta in! Odit iure ut ratione, dolorum cupiditate perferendis voluptatum sapiente, dignissimos sunt necessitatibus, reprehenderit consequatur dolorem. Aliquam veniam quaerat, pariatur deserunt reiciendis vero vitae, repellat omnis sequi dolor nesciunt. Nihil similique alias impedit, obcaecati eligendi delectus voluptatum! Ipsum, vel.</p>
    // <p>Sint, perspiciatis nemo aut, rerum excepturi deleniti modi quos nihil corporis eum, maiores soluta labore, consectetur eligendi nesciunt. Placeat, incidunt! Illum placeat eligendi, veritatis consectetur eum! Dolor obcaecati minima ab placeat voluptatem neque modi doloribus, magnam qui voluptate eaque in. Nulla expedita hic porro architecto facere officiis vitae numquam, dolor!</p>
    // <p>Perferendis quis ea incidunt ducimus nisi voluptate natus. Repellat asperiores quod rerum rem quos blanditiis enim modi, veniam voluptas a facilis! Velit cum omnis, voluptatum eum inventore! Corrupti, suscipit, neque distinctio expedita est laboriosam cum aliquid minus tempora quaerat officia possimus unde vel deleniti eaque fugit accusamus iusto dolorum natus.</p>
    //
    // <p>Demo by Austin Wulf. <a href="http://www.sitepoint.com/pure-css-off-screen-navigation-menu">See article</a>.</p>
    //         hallo welt

  }

  public render(): JSX.Element {
    return (
     <div>
      <ul className="navigation">

      	<li className="nav-item"><a href="#"><img src={Clavator} width="150px" title="Clavator"/></a></li>
      	<li className="nav-item"><a href="#CreateKey">CreateKey</a></li>
      	<li className="nav-item"><a href="#">Write2YubiKey</a></li>
      	<li className="nav-item"><a href="#KeyChainList">KeyChainList</a></li>
      	<li className="nav-item"><a href="#CardStatusList">CardStatusList</a></li>
      	<li className="nav-item"><a href="#Progressor">Logs</a></li>
      	<li className="nav-item"><a href="#ResetYubikey">ResetYubikey</a></li>
      </ul>

      <input type="checkbox" id="nav-trigger" className="nav-trigger" />
      <label htmlFor="nav-trigger"><ChannelStatus channel={this.state.channel} /></label>

      <div className="site-wrap">

        <a name="CreateKey"></a>
        <h3>CreateKey</h3>
        <CreateKey channel={this.state.channel} />
        <a name="KeyChainList"></a>
        <h3>KeyChainList</h3>
        <KeyChainList channel={this.state.channel} />
        <a name="CardStatusList"></a>
        <h3>CardStatusList</h3>
        <CardStatusList channel={this.state.channel} />
        <a name="Progressor"></a>
        <h3>Logs</h3>
        <Progressor channel={this.state.channel} msg="Clavator"/>
        <a name="ResetYubikey"></a>
        <h3>ResetYubikey</h3>
        <ResetYubikey channel={this.state.channel} />
      </div>
    </div>
    );
  }

}
