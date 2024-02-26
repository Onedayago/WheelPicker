/**
* @name: WheelPicker.js
* @description: 滚轮选择
* @author: liushun
* @date: 2024/2/23
*/

import React, {useRef, useEffect, useMemo, useState} from "react";
import {View, ScrollView, Animated, Text, StyleSheet} from "react-native";
import PropTypes from "prop-types";

const WheelItem = (props) => {

    const {value, ItemHeight, index, selectIndex, itemTextStyle, itemStyle, VisibleNum} = props;
    const relativeScrollIndex = Animated.subtract(index, selectIndex);

    const scale = relativeScrollIndex.interpolate({
        inputRange: (() => {
            const range = [0];
            for (let i = 1; i <= VisibleNum+1; i++) {
                range.unshift(-i);
                range.push(i);
            }
            return range;
        })(),
        outputRange: (() => {
            const range = [1.0];
            for (let x = 1; x <= VisibleNum+1; x++) {
                const y = 1 - x*0.2;
                range.unshift(y);
                range.push(y);
            }
            return range;
        })(),
    });

    const opacity = relativeScrollIndex.interpolate({
        inputRange: (() => {
            const range = [0];
            for (let i = 1; i <= VisibleNum+1; i++) {
                range.unshift(-i);
                range.push(i);
            }
            return range;
        })(),
        outputRange: (() => {
            const range = [1.0];
            for (let x = 1; x <= VisibleNum+1; x++) {
                const y = 1 - x*0.2;
                range.unshift(y);
                range.push(y);
            }
            return range;
        })(),
    });

    return(
        <Animated.View style={[styles.item, {height: ItemHeight, opacity, transform: [{scale}]}, itemStyle]}>
            <Text style={[styles.itemTxt, itemTextStyle]}>{value}</Text>
        </Animated.View>
    )

}

const WheelPicker = (props) => {

    const {data, ItemHeight, Width, containerStyle, itemStyle, itemTextStyle, VisibleNum, initIndex, onChange, indicatorStyle} = props;

    const [scrollY] = useState(new Animated.Value(0));
    const scrollViewRef = useRef(null);
    const lastIndex = useRef(-1);
    const delayTime = useRef(null);
    const isScrollRef = useRef(false);

    const selectIndex = useMemo(
        () => Animated.divide(scrollY, ItemHeight),
        [VisibleNum, scrollY, ItemHeight],
    );

    useEffect(()=>{
        delayTime?.current&&clearTimeout(delayTime?.current);
        if(initIndex !== lastIndex.current && !isScrollRef.current){
            delayTime.current = setTimeout(()=>{
                scrollViewRef?.current?.scrollTo({
                    y: initIndex*ItemHeight,
                    animated: false,
                });
            }, 200)
        }
    }, [initIndex]);

    useEffect(()=>{
        selectIndex.addListener((e)=>{
            const value = Math.round(e.value);
            if(lastIndex.current !== value) {
                onChange?.(value);
            }
            lastIndex.current = value;
        });
        return ()=> {
            selectIndex.removeAllListeners();
        }
    }, [])

    //渲染指示器
    const renderIndicator = () => {
        return(
            <>
                <View style={[styles.Indicator, {width: Width, top: VisibleNum*ItemHeight}, indicatorStyle]}/>
                <View style={[styles.Indicator, {width: Width, top: (VisibleNum+1)*ItemHeight}, indicatorStyle]}/>
            </>
        )
    }

    return(
        <View style={[styles.container, {width: Width, height: ItemHeight*(VisibleNum*2+1)}, containerStyle]}>
            <Animated.ScrollView
                nestedScrollEnabled={true}
                bounces={false}
                ref={scrollViewRef}
                decelerationRate="fast"
                snapToInterval={ItemHeight}
                onMomentumScrollBegin={()=>{
                    isScrollRef.current = true;
                }}
                onMomentumScrollEnd={()=>{
                    isScrollRef.current = false;
                }}
                showsVerticalScrollIndicator={false}
                onScroll={Animated.event(
                    [{ nativeEvent: {
                            contentOffset: {
                                y: scrollY
                            }
                        }
                    }], {
                        useNativeDriver: true
                    }
                )}
            >
                <View style={{height: ItemHeight*VisibleNum}}/>
                {
                    data.map((item, index) => {
                        return <WheelItem
                            value={item}
                            key={index}
                            ItemHeight={ItemHeight}
                            index={index}
                            selectIndex={selectIndex}
                            itemStyle={itemStyle}
                            itemTextStyle={itemTextStyle}
                            VisibleNum={VisibleNum}
                        />
                    })
                }
                <View style={{height: ItemHeight*VisibleNum}}/>
            </Animated.ScrollView>
            {renderIndicator()}
        </View>
    )
}

export default WheelPicker;

WheelPicker.defaultProps = {
    ItemHeight: 50,
    VisibleNum: 2,
    Width: 100,
    data: [1,2,3,4,5,6,7,8,9,10,11],
    containerStyle: {},
    itemStyle: {},
    itemTextStyle: {},
    indicatorStyle: {},
    initIndex: 1,
    onChange: ()=>{},
}

WheelPicker.propTypes = {
    ItemHeight: PropTypes.number,
    VisibleNum: PropTypes.number,
    Width: PropTypes.number,
    data: PropTypes.array,
    containerStyle: PropTypes.object,
    itemStyle: PropTypes.object,
    itemTextStyle: PropTypes.object,
    indicatorStyle: PropTypes.object,
    initIndex: PropTypes.number,
    onChange: PropTypes.func,

}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'rgba(1,1,1,0.5)',
        marginTop: 100,
        marginLeft: 100,
    },

    item: {
        justifyContent: 'center',
        alignItems: 'center',
    },

    itemTxt: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
    },

    Indicator: {
        position: 'absolute',
        zIndex: 1000,
        backgroundColor: 'black',
        height: 1,
        width: '100%',
    }
})
