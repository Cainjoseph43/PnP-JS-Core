"use strict";

import { Queryable, QueryableCollection, QueryableInstance } from "./Queryable";
import { QueryableSecurable } from "./QueryableSecurable";
import { Folder } from "./folders";
import { ContentType } from "./contenttypes";
import { TypedHash } from "../../collections/collections";
import * as Util from "../../utils/util";

/**
 * Describes a collection of Item objects
 * 
 */
export class Items extends QueryableCollection {

    /**
     * Creates a new instance of the Items class
     * 
     * @param baseUrl The url or Queryable which forms the parent of this fields collection
     */
    constructor(baseUrl: string | Queryable) {
        super(baseUrl, "items");
    }

    /**
     * Gets an Item by id
     * 
     * @param id The integer id of the item to retrieve
     */
    public getById(id: number): Item {
        this.concat(`(${id})`);
        return new Item(this);
    }

    /**
     * Adds a new item to the collection
     * 
     * @param properties The new items's properties
     */
    public add(properties: TypedHash<string | number | boolean> = {}): Promise<ItemAddResult> {

        let parentList = new QueryableInstance(this.parentUrl);

        return parentList.select("ListItemEntityTypeFullName").get().then((d) => {

            let postBody = JSON.stringify(Util.extend({
                "__metadata": { "type": d.ListItemEntityTypeFullName },
            }, properties));

            return this.post({ body: postBody }).then((data) => {
                return {
                    data: data,
                    item: this.getById(data.Id),
                };
            });
        });
    }
}


/**
 * Descrines a single Item instance
 * 
 */
export class Item extends QueryableSecurable {

    /**
     * Creates a new instance of the Items class
     * 
     * @param baseUrl The url or Queryable which forms the parent of this fields collection
     */
    constructor(baseUrl: string | Queryable) {
        super(baseUrl);
    }

    /**
     * Gets the set of attachments for this item
     * 
     */
    public get attachmentFiles(): QueryableCollection {
        this.append("AttachmentFiles");
        return new QueryableCollection(this);
    }

    /**
     * Gets the content type for this item
     * 
     */
    public get contentType(): ContentType {
        this.append("ContentType");
        return new ContentType(this);
    }

    /**
     * Gets the effective base permissions for the item
     * 
     */
    public get effectiveBasePermissions(): Queryable {
        this.append("EffectiveBasePermissions");
        return new Queryable(this);
    }

    /**
     * Gets the effective base permissions for the item in a UI context
     * 
     */
    public get effectiveBasePermissionsForUI(): Queryable {
        this.append("EffectiveBasePermissionsForUI");
        return new Queryable(this);
    }

    /**
     * Gets the field values for this list item in their HTML representation
     * 
     */
    public get fieldValuesAsHTML(): QueryableInstance {
        this.append("FieldValuesAsHTML");
        return new QueryableInstance(this);
    }

    /**
     * Gets the field values for this list item in their text representation
     * 
     */
    public get fieldValuesAsText(): QueryableInstance {
        this.append("FieldValuesAsText");
        return new QueryableInstance(this);
    }

    /**
     * Gets the field values for this list item for use in editing controls
     * 
     */
    public get fieldValuesForEdit(): QueryableInstance {
        this.append("FieldValuesForEdit");
        return new QueryableInstance(this);
    }

    /**
     * Gets the folder associated with this list item (if this item represents a folder)
     * 
     */
    public get folder(): Folder {
        return new Folder(this, "Folder");
    }


    /**
     * Updates this list intance with the supplied properties 
     * 
     * @param properties A plain object hash of values to update for the list
     * @param eTag Value used in the IF-Match header, by default "*"
     */
    public update(properties: TypedHash<string | number | boolean>, eTag = "*"): Promise<ItemUpdateResult> {

        let parentList = new QueryableInstance(this.parentUrl.substr(0, this.parentUrl.lastIndexOf("/")));

        return parentList.select("ListItemEntityTypeFullName").get().then((d) => {

            let postBody = JSON.stringify(Util.extend({
                "__metadata": { "type": d.ListItemEntityTypeFullName },
            }, properties));

            return this.post({
                body: postBody,
                headers: {
                    "IF-Match": eTag,
                    "X-HTTP-Method": "MERGE",
                },
            }).then((data) => {
                return {
                    data: data,
                    item: this,
                };
            });
        });
    }

    /**
     * Delete this item
     * 
     * @param eTag Value used in the IF-Match header, by default "*"
     */
    public delete(eTag = "*"): Promise<void> {
        return this.post({
            headers: {
                "IF-Match": eTag,
                "X-HTTP-Method": "DELETE",
            },
        });
    }
}

export interface ItemAddResult {
    item: Item;
    data: any;
}

export interface ItemUpdateResult {
    item: Item;
    data: any;
}
