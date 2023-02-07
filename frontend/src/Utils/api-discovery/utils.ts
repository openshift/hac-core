import { plural } from 'pluralize';
import { K8sGroupVersionKind, K8sModelCommon, K8sResourceKindReference } from '@openshift/dynamic-plugin-sdk-utils';
import startCase from 'lodash/startCase';
import keyBy from 'lodash/keyBy';
import merge from 'lodash/merge';
import { abbrDisallowed } from './consts';

export const kindToAbbr = (kind: string) => {
  const abbrKind = (kind.replace(/[^A-Z]+/g, '') || kind.toUpperCase()).slice(0, 4);
  return abbrDisallowed.includes(abbrKind) ? abbrKind.slice(0, -1) : abbrKind;
};

export const pluralizeKind = (kind: string): string => {
  // Use startCase to separate words so the last can be pluralized but remove spaces so as not to humanize
  const pluralized = plural(startCase(kind)).replace(/\s+/g, '');
  // Handle special cases like DB -> DBs (instead of DBS).
  if (pluralized === `${kind}S`) {
    return `${kind}s`;
  }
  return pluralized;
};

export const getReference = ({ group, version, kind }: K8sGroupVersionKind): K8sResourceKindReference => [group || 'core', version, kind].join('~');

const getReferenceForModel = ({ apiVersion: version, apiGroup: group, kind }: K8sModelCommon): K8sResourceKindReference =>
  getReference({ group, version, kind });

export const mergeByKey = (prev: K8sModelCommon[], next: K8sModelCommon[]) =>
  Object.values(merge(keyBy(prev, getReferenceForModel), keyBy(next, getReferenceForModel)));
