/*
 * Copyright (C) 2014 Intel Corporation
 * All rights reserved.
 */
package com.intel.mtwilson.trustagent.setup;

import com.intel.mtwilson.setup.AbstractSetupTask;
import com.intel.mtwilson.trustagent.TrustagentConfiguration;

/**
 *
 * @author jbuhacoff
 */
public class CreateTpmSrkSecret extends AbstractSetupTask {
    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(CreateTpmSrkSecret.class);
    
    @Override
    protected void configure() throws Exception {
    }

    @Override
    protected void validate() throws Exception {
        TrustagentConfiguration trustagentConfiguration = new TrustagentConfiguration(getConfiguration());
        String tpmSrkSecretHex = trustagentConfiguration.getTpmSrkSecretHex();
        if( tpmSrkSecretHex == null || tpmSrkSecretHex.isEmpty() ) {
            validation("TPM SRK secret is not set");
        }
    }

    @Override
    protected void execute() throws Exception {
        String tpmSrkSecretHex = "0000000000000000000000000000000000000000"; // to match existing ProvisionTPM hard-coded value;  TODO: change to RandomUtil.randomHexString(20) after verifying rest of stack can handle well-known SRK ... well-known SRK may be a bad assumption, but at least now we have an option to use a configured value instead;  see issue #1012
        log.info("Generated well-known SRK secret"); 
        getConfiguration().setString(TrustagentConfiguration.TPM_SRK_SECRET, tpmSrkSecretHex);
    }
    
}
