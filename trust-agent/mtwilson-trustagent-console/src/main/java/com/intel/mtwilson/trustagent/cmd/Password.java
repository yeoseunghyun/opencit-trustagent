/*
 * Copyright (C) 2014 Intel Corporation
 * All rights reserved.
 */
package com.intel.mtwilson.trustagent.cmd;

import com.intel.dcsg.cpg.console.Command;
import com.intel.dcsg.cpg.console.input.Input;
import com.intel.dcsg.cpg.crypto.RandomUtil;
import com.intel.mtwilson.My;
import com.intel.mtwilson.shiro.file.LoginDAO;
import com.intel.mtwilson.trustagent.TrustagentConfiguration;
import java.io.File;
import org.apache.commons.configuration.Configuration;
import com.intel.mtwilson.shiro.file.model.UserPassword;
import com.intel.mtwilson.shiro.file.model.UserPermission;
import com.intel.mtwilson.shiro.authc.password.PasswordCredentialsMatcher;
import java.io.IOException;
import java.nio.charset.Charset;
import java.util.List;
/**
 *
 * @author jbuhacoff
 */
public class Password implements Command {
    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(Password.class);
    private TrustagentConfiguration configuration;
    private Configuration options;
    private LoginDAO dao;
    
    @Override
    public void setOptions(Configuration options) {
        this.options = options;
    }
    
    // never returns null but password may be empty (and that's allowed)
    private String getPassword(String[] args) throws Exception {
        String password;
        if( options.getBoolean("nopass", false) ) {
            password = "";
        }
        else if(args.length > 1) {
            password = args[1]; // always after username if present
            if( password == null || password.isEmpty() ) {
                throw new IllegalArgumentException("Password is empty");
            }
            if( password.startsWith("env:") && password.length() > 4 ) {
                String variableName = password.substring(4);
                password = System.getenv(variableName);
                if( password == null || password.isEmpty() ) {
                    throw new IllegalArgumentException(String.format("Environment variable %s does not contain a password", variableName));
                }
            }
        }
        else {
            password = Input.getConfirmedPasswordWithPrompt(String.format("Choose a password for %s",args[0])); // throws IOException, or always returns value or expression
            if( password == null || password.isEmpty() ) {
                throw new IllegalArgumentException("Input password is empty");
            }
        }
        return password;
    }
    // get the 3rd arg if it's usrename passsword permissions, or the 2nd arg if it's username --nopass permissions
    private String getPermissions(String[] args) throws Exception {
        String permissions = null;
        if( args.length == 2 && options.getBoolean("nopass", false) ) {
            permissions = args[1];
        }
        else if(args.length == 3 ) {
            permissions = args[2];
        }
        return permissions;
    }

    @Override
    public void execute(String[] args) throws Exception {
        configuration = TrustagentConfiguration.loadConfiguration();
        
        // store or replace the user record
        log.debug("Loading users and permissions");
        dao = new LoginDAO(configuration.getTrustagentUserFile(), configuration.getTrustagentPermissionsFile());
        
        // usage:   username  (prompt for password, no permissions)
        // usage:   username password  (no permissions)
        // usage:   username password permissions
        // usage:   username --nopass  (no permissions)
        // usage:   username --nopass permissions
        // usage:   username --remove
        String username = args[0];
        
        if( options.getBoolean("remove",false) ) {
            removeUser(username);
            removePermissions(username);
            log.info("Removed username {}", username);
            return;
        }
        
        String password = getPassword(args); // never returns null but password may be empty 
        
        // create the new user record
        UserPassword userPassword = new UserPassword();
        userPassword.setAlgorithm("SHA256");
        userPassword.setIterations(1);
        userPassword.setSalt(RandomUtil.randomByteArray(8));
        byte[] hashedPassword = PasswordCredentialsMatcher.passwordHash(password.getBytes(Charset.forName("UTF-8")), userPassword);
        userPassword.setUsername(username);
        userPassword.setPasswordHash(hashedPassword);
        removeUser(username);
        dao.createUser(userPassword);
        log.info("Created user {}", username);
        
        String newPermissions = getPermissions(args);
        if( newPermissions != null ) { 
            removePermissions(username);
            dao.addPermission(username, newPermissions);
            log.info("Added permissions {}", newPermissions);
        }
        
    }
    
    private void removeUser(String username) throws IOException {
        UserPassword existingUser = dao.findUserByName(username);
        if( existingUser != null ) {
            dao.deleteUserByName(username);
        }
    }
    private void removePermissions(String username) throws IOException {
        List<UserPermission> existingPermissions = dao.getPermissions(username);
        for(UserPermission existingPermission : existingPermissions) {
            dao.removePermission(username, existingPermission.toString());
        }
    }
    
}