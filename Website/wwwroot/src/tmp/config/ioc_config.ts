import "reflect-metadata";

import { Container } from "../../../../../node_modules/inversify/dts/inversify";


import {
    Modal
} from "../entities/index";

import {
    IModal
} from "../interfaces/index";


import SERVICE_IDENTIFIER from "../constants/identifiers";
import TAG from "../constants/tags";

let container = new Container();

container.bind<IModal>(SERVICE_IDENTIFIER.TEST).to(Modal);

export default container;