import * as React from 'react';
import './app.less';
import './app-state';


export class KeyChainList extends React.Component<{}, AppState> {

  constructor() {
    super();
  }

  public static contextTypes = {
   socket: React.PropTypes.object
  };
 

  componentWillReceiveProps(nextProps: any, nextContext: any) {
    debugger
  }

  shouldComponentUpdate(nextProps: any,  nextState: any,  nextContext: any) : boolean {
    debugger
    return true;
  }

  componentWillUpdate(nextProps: any, nextState: any, nextContext: any) {
    debugger
  }

  componentDidUpdate(prevProps: any, prevState: any, prevContext: any) {
    debugger
  }


  public render(): JSX.Element {
    return (
      <div className="KeyChainList">
        More World
        <ul>
          <li>lala</li>
        </ul>
      </div>
    );
  }

}
