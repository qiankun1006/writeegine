/**
 * Point 类单元测试
 */

import {Point} from '../Point';

describe('Point', () => {
    test('should create point with default values', () => {
        const point = new Point();
        expect(point.x).toBe(0);
        expect(point.y).toBe(0);
    });

    test('should create point with specified values', () => {
        const point = new Point(10, 20);
        expect(point.x).toBe(10);
        expect(point.y).toBe(20);
    });

    test('should copy from another point', () => {
        const point1 = new Point(5, 15);
        const point2 = new Point();
        point2.copyFrom(point1);
        expect(point2.x).toBe(5);
        expect(point2.y).toBe(15);
    });

    test('should clear point values', () => {
        const point = new Point(10, 20);
        point.clear();
        expect(point.x).toBe(0);
        expect(point.y).toBe(0);
    });

    test('should set point values', () => {
        const point = new Point();
        point.setTo(30, 40);
        expect(point.x).toBe(30);
        expect(point.y).toBe(40);
    });

    test('should calculate distance to another point', () => {
        const point1 = new Point(0, 0);
        const point2 = new Point(3, 4);
        const distance = point1.distanceTo(point2);
        expect(distance).toBe(5); // 3-4-5 triangle
    });

    test('should perform linear interpolation', () => {
        const point1 = new Point(0, 0);
        const point2 = new Point(10, 20);
        point1.lerp(point2, 0.5);
        expect(point1.x).toBe(5);
        expect(point1.y).toBe(10);
    });

    test('should clone point', () => {
        const point1 = new Point(25, 35);
        const point2 = point1.clone();
        expect(point2.x).toBe(25);
        expect(point2.y).toBe(35);
        expect(point2).not.toBe(point1); // Different objects
    });

    test('should check equality', () => {
        const point1 = new Point(10, 20);
        const point2 = new Point(10, 20);
        const point3 = new Point(15, 25);
        expect(point1.equals(point2)).toBe(true);
        expect(point1.equals(point3)).toBe(false);
    });

    test('should convert to string', () => {
        const point = new Point(10, 20);
        expect(point.toString()).toBe('Point(10, 20)');
    });

    test('should create static points', () => {
        expect(Point.ZERO.x).toBe(0);
        expect(Point.ZERO.y).toBe(0);
        expect(Point.ONE.x).toBe(1);
        expect(Point.ONE.y).toBe(1);
    });

    test('should create point using static method', () => {
        const point = Point.create(15, 25);
        expect(point.x).toBe(15);
        expect(point.y).toBe(25);
    });
});

