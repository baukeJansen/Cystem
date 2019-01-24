﻿var serviceManager: ServiceManager = new ServiceManager();
serviceManager.register(Cystem);
serviceManager.register(Navigate);
serviceManager.register(OverlayHelper);
serviceManager.register(ModalHelper);
serviceManager.register(Materialize);
serviceManager.register(Graph);
serviceManager.register(Formtab);
serviceManager.register(FloatingActionButton);
serviceManager.init();

var cystem: Cystem = serviceManager.get(Cystem);
cystem.bindNew(document.body);