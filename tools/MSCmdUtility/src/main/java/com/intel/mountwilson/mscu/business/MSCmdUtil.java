/*
 * Copyright (C) 2012 Intel Corporation
 * All rights reserved.
 */
package com.intel.mountwilson.mscu.business;

import com.intel.mountwilson.mscu.common.MSCUConfig;
import com.intel.mtwilson.ApiClient;
import com.intel.mtwilson.agent.vmware.VMwareClient;
import com.intel.mtwilson.api.ApiException;
import com.intel.mtwilson.api.ManagementService;
import com.intel.dcsg.cpg.crypto.RsaCredential;
import com.intel.dcsg.cpg.crypto.SimpleKeystore;
import com.intel.mtwilson.datatypes.TxtHostRecord;
import com.intel.dcsg.cpg.io.Filename;
import com.intel.dcsg.cpg.tls.policy.impl.InsecureTlsPolicy;
import java.io.*;
import java.net.MalformedURLException;
import java.net.URL;
import java.security.KeyStoreException;
import java.util.List;
import java.util.Properties;
import org.apache.commons.configuration.MapConfiguration;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 *
 * @author ssbangal
 */
public class MSCmdUtil {
    private static Logger log = LoggerFactory.getLogger(MSCmdUtil.class);

    static ApiClient apiClientObj = null;
//    static String propertiesFile = "C:/Intel/CloudSecurity/mscommandutility.properties";
//    static Configuration config = ConfigurationFactory.loadConfiguration(propertiesFile);

    private static ApiClient createAPIObject(String keyAliasName, String keyPassword) throws MalformedURLException, ApiException {
        
        ApiClient rsaApiClient = null;
        
        try {
                        
            URL baseURL = new URL(MSCUConfig.getConfiguration().getString("mtwilson.api.baseurl"));            
            String keystoreFilename = MSCUConfig.getConfiguration().getString("mtwilson.mscu.keystore.dir") + File.separator + Filename.encode(keyAliasName) + ".jks";
            
            // Open the keystore with the password and retrieve the credentials
            File keyStoreFile;
            SimpleKeystore keystore = null; 
            RsaCredential credential = null;             
            
            try {

                keyStoreFile = new File(keystoreFilename);

            } catch (Exception ex) {
                
                System.out.println(String.format("Key store is not configured/saved correctly in %s.", keystoreFilename));
                throw new IllegalStateException(String.format("Key store is not configured/saved correctly in %s.", keystoreFilename));
//                System.exit(0);
            }

            try {

                keystore = new SimpleKeystore(keyStoreFile, keyPassword);
                credential = keystore.getRsaCredentialX509(keyAliasName, keyPassword);

            } catch (KeyStoreException kse) {

                System.out.println(String.format("Username or Password does not match. Please try again. %s", kse.getMessage()));
                throw new IllegalStateException(String.format("Username or Password does not match. Please try again. %s", kse.getMessage()));
//                System.exit(0);

            } catch (Exception ex) {

                System.out.println(String.format("Error during user authentication. %s", ex.getMessage()));
                throw new IllegalStateException(String.format("Error during user authentication. %s", ex.getMessage()));
//                System.exit(0);

            }

            try {
                
                Properties prop = new Properties();
                prop.setProperty("mtwilson.api.ssl.requireTrustedCertificate", "true"); // must be secure out of the box!
                prop.setProperty("mtwilson.api.ssl.verifyHostname", "true"); // must be secure out of the box!            

                rsaApiClient = new ApiClient(baseURL, credential, keystore, new MapConfiguration(prop));
                
            } catch (Exception ex) {

                System.out.println(String.format("Error during user authentication. %s", ex.getMessage()));
                throw new IllegalStateException(String.format("Error during user authentication. %s", ex.getMessage()));
//                System.exit(0);
                
            } 

        } catch (Exception ex) {

            System.out.println(String.format("Error during user authentication. %s", ex.getMessage()));
            throw new IllegalStateException(String.format("Error during user authentication. %s", ex.getMessage()));
//            System.exit(0);
        }
        
        return rsaApiClient;            
    }

    /**
     * @param args the command line arguments
     */
    public static void main(String[] args) {
        ManagementService msClient = null;
        String userInput;
        InputStreamReader isr = new InputStreamReader(System.in);
        BufferedReader br = new BufferedReader(isr);
        
        if (args.length != 2) {
            System.out.println("Usage: MSCmdUtil LoginID Password");
            throw new IllegalStateException("Usage: MSCmdUtil LoginID Password");
//            System.exit(0);
        }
        
        String userName = args[0];
        String userPassword = args[1];
        
        try {
            msClient = (ManagementService) createAPIObject(userName, userPassword);
            if (msClient == null) {
                throw new IllegalStateException("Failed to initialize the management service API client object.");
            }
        } catch (Exception ex) {
            System.out.println(String.format("Error while authenticating the user. %s", ex.getMessage()));
        }
                
        try {
            
            while(true){
                
                System.out.println("\n\nChoose one of the following: \n\t" + 
                            "1: WhiteList Configuration \n\t" + 
                            "2: Host Registration \n\t" + 
                            "3: Quit");
                System.out.print("\nOption Selected: ");
                
                userInput = br.readLine();
                switch (Integer.parseInt(userInput)) {
                    
                    case 1:
                        
                        String gkvHostType = MSCUConfig.getConfiguration().getString("mtwilson.mscu.gkvHostType");
                        System.out.println(String.format("\nHost with good known white lists - [Default :{%s} of type {%s}]",
                                MSCUConfig.getConfiguration().getString("mtwilson.mscu.gkvHost"), gkvHostType));
                        
                        userInput = getUserInput(MSCUConfig.getConfiguration().getString("mtwilson.mscu.gkvHost"), 
                                String.format("Press Enter to accept default or provide a new value of type {%s}: ", gkvHostType));

                        log.debug("White list values will be configured using the host : {}", userInput);

                        TxtHostRecord gkvHostObj = new TxtHostRecord();
                        if (gkvHostType.equalsIgnoreCase("VMware")) {

                            gkvHostObj.HostName = userInput;
                            gkvHostObj.AddOn_Connection_String = MSCUConfig.getConfiguration().getString("mtwilson.mscu.isolatedVCenter");

                        } else if(gkvHostType.equalsIgnoreCase("Xen") || gkvHostType.equalsIgnoreCase("KVM")) {

                            gkvHostObj.HostName = userInput;
                            gkvHostObj.IPAddress = userInput;
                            gkvHostObj.Port = Integer.parseInt(MSCUConfig.getConfiguration().getString("mtwilson.mscu.hostPort"));

                        } else {

                            System.out.println("Please configure the VMM Type of the good known host correctly. Exiting...");
                            throw new IllegalStateException("Please configure the VMM Type of the good known host correctly. Exiting...");
//                            System.exit(0);
                        }
                        
                        try {
                            // Now that the host object is created, let is call into the White List configuration API
                            boolean configureWhiteList = msClient.configureWhiteList(gkvHostObj);
                            System.out.println("About to configure whitelist");
                            if (configureWhiteList) {
                                log.debug("Successfully configured the white list database using the host : {}", gkvHostObj.HostName);
                                System.out.println(String.format("Successfully configured the white list database using the host : %s", gkvHostObj.HostName));
                            }

                        } catch (Exception ex) {
                            log.error(ex.getMessage());
                            System.out.println(ex.getMessage());
                        } 
                        
                        break;
                        
                    case 2:
                        
                        String hostInputOption = MSCUConfig.getConfiguration().getString("mtwilson.mscu.hostInputOption");
                        if (hostInputOption.equalsIgnoreCase("File")) {
                            try {
                                
                                String hostFileName = MSCUConfig.getConfiguration().getString("mtwilson.mscu.fileName");
                                if (!hostFileName.startsWith(System.getProperty("user.home")) && !hostFileName.startsWith("/var/")) {
                                    throw new IllegalArgumentException("Host file name must exist within the user home directory or the /var/ directory.");
                                }
                                hostFileName = getUserInput(hostFileName, 
                                    "Press Enter to accept default or provide a new path to file: " + hostFileName);
                                
                                log.debug("Hosts configured in the file : {} would be registered with Mt.Wilson", hostFileName);
                                try (BufferedReader hfr = new BufferedReader(new FileReader(hostFileName))) {
                                    String hostDetails;
                                    
                                    while((hostDetails = hfr.readLine()) != null) {
                                        
                                        // Let us first split the line into the hypervisor type, host name and port/vCenter
                                        String[] hostInfo = hostDetails.split("::");
                                        TxtHostRecord newHostObj = new TxtHostRecord();
                                        
                                        if (hostInfo[1].contains("http")) {
                                            
                                            newHostObj.HostName = hostInfo[0];
                                            newHostObj.AddOn_Connection_String = hostInfo[1];
                                            
                                        } else {
                                            
                                            newHostObj.HostName = hostInfo[0];
                                            newHostObj.IPAddress = hostInfo[0];
                                            newHostObj.Port = Integer.parseInt(hostInfo[1]);
                                        }
                                        
                                        userInput = getUserInput("Y",String.format("Registering Host : {%s}. Press Enter OR 'Y' to continue. " +
                                                "Enter any other character to skip registration.", newHostObj.HostName));
                                        if (!userInput.equalsIgnoreCase("Y")) {
                                            
                                            System.out.println("Skipping registration of host : " + newHostObj.HostName);
                                            continue;
                                        }                               
                                        
                                        try {
                                            // Process the host registration
                                            boolean registerHost = msClient.registerHost(newHostObj);
                                            if (registerHost) {
                                                log.debug("Successfully registered the host : {}", newHostObj.HostName);
                                                System.out.println(String.format("Successfully registered the host : %s", newHostObj.HostName));
                                            }
                                            
                                        } catch (Exception ex) {
                                            
                                            // Print out a message and continue with processing the remaining hosts
                                            log.error("Error during the registration of host : {}. Details: ", newHostObj.HostName, ex.getMessage());
                                            System.out.println(String.format("Error during the registration of host : %s. Details: %s", newHostObj.HostName, ex.getMessage()));
                                        }
                                    }
                                }
                            } catch (Exception ex) {

                                // We get here if there is some kind of IOException or the file format is not right
                                // Print out the error and exit.
                                log.error("Error during parsing of the input file. Please check for correctness.");                                
                                System.out.println("Error during parsing of the input file. Please check for correctness.");
                                throw ex;
                            }

                        } else if (hostInputOption.equalsIgnoreCase("Cluster")) {

                            String clusterName = MSCUConfig.getConfiguration().getString("mtwilson.mscu.clusterName");

                            clusterName = getUserInput(clusterName, 
                                "Press Enter to accept default or provide a new Cluster name: " + clusterName);

                            log.debug("Hosts configured in the vCenter Cluster : {} would be registered with Mt.Wilson", clusterName);
                            
                            String prodVCenter = MSCUConfig.getConfiguration().getString("mtwilson.mscu.productionVCenter");
                            List<TxtHostRecord> hostList;

                            try {
                                // retrieve the details of the hosts configured in the cluster on the specified vCenter server
                                VMwareClient vmHelperObj = new VMwareClient();
//                                vmHelperObj.setTlsPolicy(new InsecureTlsPolicy()); //  if you need an insecure policy use InsecureTlsPolicy() instead of making  a separate connect() method in the client;  XXX TODO need to 1) rewrite client methods that reconnect with custom insecure trust manager to use the tls policy provided by setTlsPolicy(), and 2) need to create a separate table in the database to track vcenter tls certificates so they can be used and managed independently of host records.
//                                vmHelperObj.connect(prodVCenter);
                                hostList = vmHelperObj.getHostDetailsForCluster(clusterName, prodVCenter);

                            } catch (Exception ex) {

                                // If we get an exception while reading the cluster, there is nothing much we can do
                                // so exit
                                log.error("Error during retrieval of host details from the cluster. {}", ex.getMessage());
                                throw ex;
                            }

                            for (TxtHostRecord hostObj : hostList) {

                                hostObj.AddOn_Connection_String = prodVCenter;

                                userInput = getUserInput("Y",String.format("Registering Host : {%s}. Press Enter OR 'Y' to continue. " + 
                                        "Enter any other character to skip registration.", hostObj.HostName));
                                if (!userInput.equalsIgnoreCase("Y")) {

                                    System.out.println("Skipping registration of host : " + hostObj.HostName);
                                    continue;
                                }

                                try {

                                    boolean registerHost = msClient.registerHost(hostObj);
                                    if (registerHost) {
                                        log.debug("Successfully registered the host : {}", hostObj.HostName);
                                        System.out.println(String.format("Successfully registered the host : %s", hostObj.HostName));
                                    }

                                } catch (Exception ex) {

                                    // Print out a message and continue with processing the remaining hosts
                                    log.error("Error during the registration of host : {}. Details: {}", hostObj.HostName, ex.getMessage());
                                    System.out.println(String.format("Error during the registration of host : %s. Details: %s", hostObj.HostName, ex.getMessage()));
                                }                            
                            }
                        }
                        
                        break;
                        
                    case 3:

                        System.out.println("User chose to quit");
                        throw new IllegalStateException("User chose to quit");
//                        System.exit(0);
//                        break;
                        
                    default:
                        
                        break;
                }
            }
        } catch (Exception ex) {
            
            log.error("Unexpected error. {} {}", ex.getMessage(), ex.getStackTrace());
            System.out.println(ex.getMessage());
            
        }
    }
    
    private static String getUserInput(String defaultValue, String printMessage) throws IOException {
        String userInput;
        
        try {
        InputStreamReader isr = new InputStreamReader(System.in);
        BufferedReader br = new BufferedReader(isr);

        if (MSCUConfig.getConfiguration().getString("mtwilson.mscu.userApprovalRequired").equalsIgnoreCase("true")) {
                System.out.print(printMessage);
                userInput = br.readLine();
                if(userInput !=  null) {
                    if (userInput.isEmpty())
                        userInput = defaultValue;
                }else{
                    userInput = defaultValue;
                }
            } else{
                userInput = defaultValue;
            }
        } catch (Exception ex) {
            userInput = defaultValue;
        }
        return userInput;
    }
      
}
