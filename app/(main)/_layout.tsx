import CustomIcon from "@/components/CustomIcon";
import { Tabs } from "expo-router";

export default function MainLayout() {
    return (
        <Tabs screenOptions={{
            headerShown: false, 
            tabBarInactiveTintColor:"darkgray",
            tabBarLabelStyle:{
                fontFamily:"DMSans-Bold",
            }
            }}>
            <Tabs.Screen 
            name="Lists" 
            options={{
                tabBarIcon: ({color}) => (
                    <CustomIcon size={25} name="list"  type="entypo" color={color} />
                )
            }}
            />
            <Tabs.Screen 
            name="Swipe" 
            options={{
                tabBarIcon: ({color}) => (
                    <CustomIcon size={25} name="swipe" color={color} />
                )
            }}
            />
            <Tabs.Screen 
            name="Daily" 
            options={{
                tabBarIcon: ({color}) => (
                    <CustomIcon size={25} name="bookmark" color={color}  />
                )
            }}
            />
            <Tabs.Screen 
            name="Progress" 
            options={{
                tabBarIcon: ({color}) => (
                    <CustomIcon size={25} name="barschart" type="antdesign" color={color} />
                )
            }}
            />
            <Tabs.Screen 
            name="Settings" 
            options={{
                tabBarIcon: ({color}) => (
                    <CustomIcon size={25} name="settings" color={color} />
                )
            }}
            />
        </Tabs>
    )
}