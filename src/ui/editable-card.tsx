

/*

import * as React from 'react';
import './app.less';

import * as Message from '../message';
import ChangeCard from '../gpg/change_card';
import Pin from '../gpg/pin';
import * as WsChannel from './ws-channel';
import CardStatusListState from './card-status-list-state';
import AskAdminPin from './ask-admin-pin';
import * as ReactModal from 'react-modal';

enum EditableCardStates {
  Literale,
  Editable,
  Storing
}

interface EditableCardState {
  editable: EditableCardStates;
  inputs: object[];

}

interface EditableCardProps extends React.Props<EditableCard> {
  value: string;
  action: string;
  serialNo: string;
  channel: WsChannel.Dispatch;
  cardStatusListState: CardStatusListState;
}

export class EditableCard
  extends React.Component<EditableCardProps, EditableCardState>
{

  constructor() {
    super();
    this.state = {
      editable: EditableCardStates.Literale,
      inputs: []
    };
    this.editAction = this.editAction.bind(this);
    this.constAction = this.constAction.bind(this);
    // this.changeAction = this.changeAction.bind(this);
    // console.log("EditableCard::EditableCard")
  }

  // protected bindOnChangeChildren(): void {
  //   console.log("bindOnChangeChildren")
  //   React.Children.forEach(this.props.children, (child: React.ReactChild) => {
  //     let re = child as React.ReactElement<any>;
  //     console.log("bind up:", re.props.onChange, child)
  //     if (re.props.onChange) {
  //        re.props.onChange = re.props.onChange.bind(child)
  //     }
  //   })
  // }

  private editAction() {
    this.setState(Object.assign({}, this.state, { editable: EditableCardStates.Editable }))
  }
  private constAction() {
    // console.log("constAction");
    // React.Children.forEach(this.props.children, (child: React.ReactChild) => {
    //   let re = child as any;
    //   console.log("constAction", re.setProps({value: }));
    //   debugger;
    // })
    // debugger;
    // this.props.completeAction(this.state.inputs)
    let cc = new ChangeCard();
    cc.action = this.props.action;
    cc.params = this.state.inputs.map((i: any) => i.value);
    cc.serialNo = this.props.serialNo;
    cc.adminPin = new Pin();
    cc.adminPin.pin = "hello";//this.props.cardStatusListState.adminPins[this.props.]

    this.setState(Object.assign({}, this.state, { editable: EditableCardStates.Storing }))
    this.props.channel.send(Message.prepare("ChangeCard", cc), (error: any) => {
      if (error) {
      }
    });
  }

  private render_storing() {
    return (
      <span key={this.props.value}>
        {this.props.value} <i onClick={this.editAction} className="fa fa-save"></i>
      </span>
    );
  }

  private render_literale() {
    return (
      <span key={this.props.value}>
        {this.props.value} <i onClick={this.editAction} className="fa fa-pencil"></i>
      </span>
    );
  }

  // private changeAction(e: any): void {
  //   e.target.value = e.target.value;
  //   // React.Children.forEach(this.props.children, (child: React.ReactChild) => {
  //   //   let re = child as React.ReactElement<any>;
  //   //   debugger 
  //   //   // re.props.defaultValue = e.target.value;
  //   //   console.log(re.props, e.target.value);

  //   //   // if (re.type == "input") {
  //   //     // console.log(child)
  //   //   // }
  //   // })

  // }

  private bindRefToChildren(children: any) {
    // return children;
    this.state.inputs.length = 0;
    let r = React.Children.map(children, (child) => {
      let re = child as React.ReactElement<any>;
      if (re.type == "input" || re.type == "select") {
        return React.cloneElement(re, {
          ref: (input: any) => { input && this.state.inputs.push(input); return input }
        })
      } else {
        return re;
      }
    });
    // console.log(children, r)
    return r;//React.cloneElement(children, {}, r)
  }

  private render_editable() {
    // <span onChange={this.changeAction}>
    // </span>
    console.log("render_editable")
    return (
      <ReactModal
        isOpen={true}
        closeTimeoutMS={150}
        onAfterOpen={() => { }}
        onRequestClose={this.constAction}
        contentLabel="Modal"
      >
        <h2 ref="subtitle">Hello</h2>
        <button onClick={this.constAction}>close</button>

        <span key={this.props.value}>
          <AskAdminPin cardStatusListState={this.props.cardStatusListState} serialNo={this.props.serialNo} />
          {this.bindRefToChildren(this.props.children)}
          <i onClick={this.constAction} className="fa fa-save"></i>
        </span>
      </ReactModal>
    );
  }


  public render(): JSX.Element {
    // {d.getFullYear()}-{d.getMonth() + 1}-{d.getDate()}
    switch (this.state.editable) {
      case EditableCardStates.Literale:
        return this.render_literale();
      case EditableCardStates.Editable:
        return this.render_editable();
      case EditableCardStates.Storing:
        return this.render_storing();
    }
  }
}

export default EditableCard;
*/