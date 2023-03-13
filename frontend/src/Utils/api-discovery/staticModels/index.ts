import core from './core';
import apps from './apps';
import configOpenshift from './config.openshift.io';
import appsOpenshift from './apps.openshift.io';

export default {
  '/api/v1': core,
  '/apis/apps/v1': apps,
  '/apis/config.openshift.io/v1': configOpenshift,
  '/apis/apps.openshift.io/v1': appsOpenshift,
};
