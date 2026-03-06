/**
 * 显示对象数据类
 * @author skeleton-animation-system
 */

import {BaseData} from './BaseData';
import {Transform} from '../geom/Transform';

export class DisplayData extends BaseData {
    public type: DisplayType = DisplayType.Image;
    public path: string = "";
    public transform: Transform = new Transform();
    public width: number = 0;
    public height: number = 0;
    public meshData: any = null; // 网格数据，具体类型根据实现而定

    constructor(name: string = "") {
        super(name);
    }

    /**
     * 重置数据
     */
    public override reset(): void {
        super.reset();
        this.type = DisplayType.Image;
        this.path = "";
        this.transform.clear();
        this.width = 0;
        this.height = 0;
        this.meshData = null;
    }

    /**
     * 克隆显示对象数据
     */
    public override clone(): DisplayData {
        const displayData = new DisplayData(this.name);
        displayData.type = this.type;
        displayData.path = this.path;
        displayData.transform.copyFrom(this.transform);
        displayData.width = this.width;
        displayData.height = this.height;
        displayData.meshData = this.meshData; // 浅拷贝，实际使用时可能需要深拷贝
        displayData.userData = this.userData;
        return displayData;
    }

    /**
     * 转换为JSON
     */
    public override toJSON(): any {
        const json = super.toJSON();
        json.type = this.type;
        json.path = this.path;
        json.transform = {
            x: this.transform.x,
            y: this.transform.y,
            skewX: this.transform.skewX,
            skewY: this.transform.skewY,
            scaleX: this.transform.scaleX,
            scaleY: this.transform.scaleY
        };
        json.width = this.width;
        json.height = this.height;

        if (this.meshData) {
            json.meshData = this.meshData;
        }

        return json;
    }

    /**
     * 从JSON加载
     */
    public override fromJSON(json: any): DisplayData {
        super.fromJSON(json);
        this.type = json.type || DisplayType.Image;
        this.path = json.path || "";

        if (json.transform) {
            this.transform.setTo(
                json.transform.x || 0,
                json.transform.y || 0,
                json.transform.skewX || 0,
                json.transform.skewY || 0,
                json.transform.scaleX || 1,
                json.transform.scaleY || 1
            );
        }

        this.width = json.width || 0;
        this.height = json.height || 0;
        this.meshData = json.meshData || null;

        return this;
    }

    /**
     * 设置图像路径
     */
    public setImagePath(path: string): DisplayData {
        this.type = DisplayType.Image;
        this.path = path;
        return this;
    }

    /**
     * 设置网格数据
     */
    public setMeshData(meshData: any): DisplayData {
        this.type = DisplayType.Mesh;
        this.meshData = meshData;
        return this;
    }

    /**
     * 设置文本数据
     */
    public setTextData(textData: any): DisplayData {
        this.type = DisplayType.Text;
        this.userData = textData;
        return this;
    }

    /**
     * 设置绑定数据
     */
    public setBoundingData(boundingData: any): DisplayData {
        this.type = DisplayType.Bounding;
        this.userData = boundingData;
        return this;
    }
}

/**
 * 显示对象类型枚举
 */
export enum DisplayType {
    Image = "image",
    Armature = "armature",
    Mesh = "mesh",
    Bounding = "bounding",
    Text = "text"
}

