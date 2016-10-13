import * as ListSecretKeys from '../gpg/list_secret_keys';

interface AppState {
  secretKeys: ListSecretKeys.SecretKey[];
  objectId: number;
  socket: WebSocket;
}
export default AppState;
