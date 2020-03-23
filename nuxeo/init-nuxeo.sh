#!/usr/bin/env bash
NUX_PACKAGES="nuxeo-web-ui"

if [[ -e ${NUXEO_HOME}/packages/configured-pkg ]]; then
  echo "# Refresh MP from cache"
  rm -rf /opt/nuxeo/server/packages/.packages
  nuxeoctl mp-install --relax=false --accept=true  /opt/nuxeo/server/packages/cache/*
else
  start=$(date --utc +%Y%m%d_%H%M%SZ)
  echo "# ${start}: Installing MP ${NUX_PACKAGES} ..."
  nuxeoctl mp-install ${NUX_PACKAGES} --relax=false --accept=true
  touch ${NUXEO_HOME}/packages/configured-pkg
  # use a cache because we cannot reinstall package from the store directory
  cp -ar /opt/nuxeo/server/packages/store/ /opt/nuxeo/server/packages/cache
  end=$(date --utc +%Y%m%d_%H%M%SZ)
  echo "# ${end}: MP installed"
fi
now=$(date --utc +%Y%m%d_%H%M%SZ)
cp ${NUXEO_CONF} "${NUXEO_DATA}/nuxeo-${now}.conf"

cat << EOF > /opt/nuxeo/server/nxserver/config/cors-config.xml
<component name="org.nuxeo.corsi.demo">
  <require>org.nuxeo.ecm.platform.web.common.requestcontroller.service.RequestControllerService.defaultContrib</require>
  <extension target="org.nuxeo.ecm.platform.web.common.requestcontroller.service.RequestControllerService" point="corsConfig">
    <corsConfig name="foobar" supportedMethods="GET,POST,HEAD,OPTIONS,DELETE,PUT" exposedHeaders="Accept-Ranges,Content-Range,Content-Encoding,Content-Length, Content-Disposition">
      <pattern>/nuxeo/.*</pattern>
    </corsConfig>
  </extension>
</component>
EOF
