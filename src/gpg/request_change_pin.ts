

export class RequestChangePin {
  public action: string;
  public old_pin: string;
  public new_pin: string;
  public new_pin_verify: string;

  public static fill(js: any) : RequestChangePin {
    let ra = new RequestChangePin();
    ra.action = js['action']
    ra.old_pin = js['old_pin']
    ra.new_pin = js['new_pin']
    ra.new_pin_verify = js['new_pin_verify']
    return ra;
  }
}

export default RequestChangePin;
