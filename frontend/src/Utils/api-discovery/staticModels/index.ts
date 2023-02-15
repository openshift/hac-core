import core from './core';
import apps from './apps';
import configOs from './config.openshift.io';
import appsOs from './apps.openshift.io';

export default {
  '/api/v1': core,
  '/apis/apps/v1': apps,
  '/apis/config.openshift.io/v1': configOs,
  '/apis/apps.openshift.io/v1': appsOs,
};
