/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.intel.mtwilson.repository;

/**
 *
 * @author ssbangal
 */
public class RepositoryStoreException extends RepositoryException {
    private Locator locator;

    public RepositoryStoreException() {
        super();
    }

    public RepositoryStoreException(String message) {
        super(message);
    }

    public RepositoryStoreException(Throwable cause) {
        super(cause);
    }

    public RepositoryStoreException(Throwable cause, Locator locator) {
        super(cause);
        this.locator = locator;
    }
    
    public RepositoryStoreException(String message, Throwable cause) {
        super(message, cause);
    }

    public Locator getLocator() {
        return locator;
    }
   
}
