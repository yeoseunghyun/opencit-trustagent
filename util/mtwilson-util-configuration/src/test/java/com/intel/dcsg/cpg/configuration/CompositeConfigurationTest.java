/*
 * Copyright (C) 2014 Intel Corporation
 * All rights reserved.
 */
package com.intel.dcsg.cpg.configuration;

import org.junit.Test;
import static org.junit.Assert.*;

/**
 *
 * @author jbuhacoff
 */
public class CompositeConfigurationTest {
    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(CompositeConfigurationTest.class);

    @Test
    public void testCompositeConfiguration() {
        PropertiesConfiguration c1 = new PropertiesConfiguration();
        PropertiesConfiguration c2 = new PropertiesConfiguration();
        c1.set("fruit", "apple");
        c2.set("fruit", "banana");
        c1.set("number", "1");
        c2.set("boolean", "false");
        CompositeConfiguration cc = new CompositeConfiguration(c1, c2);
        assertEquals("apple", cc.get("fruit", null));
        assertEquals(Integer.valueOf(1), cc.get("number", null));
        assertEquals(false, cc.get("boolean", null));
        assertNull(cc.get("missing", null));
    }
    
    @Test
    public void testMutableCompositeConfiguration() {
        PropertiesConfiguration c1 = new PropertiesConfiguration();
        PropertiesConfiguration c2 = new PropertiesConfiguration();
        c1.set("fruit", "apple");
        c2.set("fruit", "banana");
        c1.set("number", "1");
        c2.set("boolean", "false");
        PropertiesConfiguration target = new PropertiesConfiguration();
        CompositeConfiguration cc = new CompositeConfiguration(target, c1, c2);
        assertEquals("apple", cc.get("fruit", null));
        cc.set("fruit", "carrot");
        assertEquals("carrot", cc.get("fruit", null));
        assertEquals("carrot", target.get("fruit", null));
        
    }
}
