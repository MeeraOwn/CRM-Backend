import { typeid } from "typeid-js";

const uid = (prefix) => {
  return typeid(prefix);
};
export default uid;
