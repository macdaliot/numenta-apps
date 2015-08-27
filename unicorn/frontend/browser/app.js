/* -----------------------------------------------------------------------------
 * Copyright © 2015, Numenta, Inc. Unless you have purchased from
 * Numenta, Inc. a separate commercial license for this software code, the
 * following terms and conditions apply:
 *
 * This program is free software: you can redistribute it and/or modify it
 * under the terms of the GNU Affero Public License version 3 as published by
 * the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero Public License for
 * more details.
 *
 * You should have received a copy of the GNU Affero Public License along with
 * this program. If not, see http://www.gnu.org/licenses.
 *
 * http://numenta.org/licenses/
 * -------------------------------------------------------------------------- */

'use strict';


/**
 * Unicorn: Cross-platform Desktop Application to showcase basic HTM features
 *  to a user using their own data stream or files.
 *
 * Main browser web code Application GUI entry point.
 */

// externals

import 'babel/polyfill';  // es6/7 polyfill Array.from()

import Fluxible from 'fluxible';
import FluxibleReact from 'fluxible-addons-react';
import isElectronRenderer from 'is-electron-renderer';
import React from 'react';
import tapEventInject from 'react-tap-event-plugin';

// internals

if(isElectronRenderer) { // desktop
  var remote = require('remote');
  var fileClient = remote.require('./lib/FileServer');
}
else { // web
  // var fileClient = require('./browser/lib/FileClientHTTPRequest');
}

import FooAction from './actions/foo';
import FooComponent from './components/foo';
import FooStore from './stores/foo';

let app;
let context;
let FooView;


// MAIN

document.addEventListener('DOMContentLoaded', () => {

  // FileClient/Server test
  fileClient.getFiles(function(error, files) {
    if(error) throw new Error('cannot get list of files');
    console.log('sample files:', files);

    fileClient.getFile(files[0], function(error, data) {
      if(error) throw new Error('cannot get file', files[0]);
      console.log('first sample file data:', files[0], data.toString());
    });
  });


  // GUI APP

  window.React = React; // dev tools @TODO remove for non-dev

  tapEventInject(); // @TODO remove when >= React 1.0

  // prepare inital gui context
  FooView = FluxibleReact.provideContext(
    FluxibleReact.connectToStores(
      FooComponent,
      [ FooStore ],
      (context, props) => {
        return context.getStore(FooStore).getState();
      }
    )
  );

  // init GUI flux/ible app
  app = new Fluxible({
    component: FooComponent,
    stores: [ FooStore ]
  });

  // add context to app
  context = app.createContext();

  // fire initial app action
  context.executeAction(FooAction, 'bar', (err) => {
    let contextEl = FluxibleReact.createElementWithContext(context);
    // let outputHtml = React.renderToString(contextEl);
    if(document && ('body' in document)) {
      React.render(contextEl, document.body);
      return;
    }
    throw new Error('React cannot find a DOM document.body to render to.');
  });

}); // DOMContentLoaded