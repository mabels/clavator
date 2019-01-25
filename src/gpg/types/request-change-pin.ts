import { Pin } from './pin';
import { computed, observable, IObservableValue } from 'mobx';

export class RequestChangePin {
  public action: string;
  public readonly _app_id: IObservableValue<string> = observable.box(undefined);
  public admin_pin: Pin = new Pin();
  public new_pin: Pin = new Pin();
  public new_pin_verify: Pin = new Pin();

  public static fill(js: any): RequestChangePin {
    let ra = new RequestChangePin();
    ra.changeAction(js['action']);
    ra._app_id.set(js['_app_id'] || js['app_id']);
    ra.admin_pin.pin.set(js['admin_pin']['pin']);
    ra.new_pin.pin.set(js['new_pin']['pin']);
    ra.new_pin_verify.pin.set(js['new_pin_verify']['pin']);
    return ra;
  }

  @computed
  public get app_id(): string {
    return this._app_id.get();
  }

  public changeAction(action: string): RequestChangePin {
    this.action = action;
    this.admin_pin.match = /^[0-9]{8}$/;
    let lenRange = '8';
    if (action == 'user' || action == 'unblock') {
      lenRange = '6,8';
    }
    let match = new RegExp(`^[0-9]{${lenRange}}$`);
    this.new_pin.match = match;
    this.new_pin_verify.match = match;
    return this;
  }

  public verify(): boolean {
    return this.verifyText().length == 0;
  }

  public verifyText(): string[] {
    let ret: string[] = [];
    ret = ret.concat(this.admin_pin.verifyText());
    ret = ret.concat(this.new_pin.verifyText());
    ret = ret.concat(this.new_pin_verify.verifyText());
    if (this.new_pin.pin != this.new_pin_verify.pin) {
      ret.push('new_pin does not match');
    }
    return ret;
  }
}
