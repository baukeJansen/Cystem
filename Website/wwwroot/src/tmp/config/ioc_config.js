import "reflect-metadata";
import { Container } from "../../../../../node_modules/inversify/dts/inversify";
import { Modal } from "../entities/index";
import SERVICE_IDENTIFIER from "../constants/identifiers";
var container = new Container();
container.bind(SERVICE_IDENTIFIER.TEST).to(Modal);
export default container;
