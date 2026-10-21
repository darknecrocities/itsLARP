import { Config } from "@remotion/cli/config";

Config.setPort(3033);
Config.setVideoImageFormat("jpeg");
Config.setCodec("h264");
Config.setAudioCodec("aac");
Config.setPixelFormat("yuv420p");
Config.setCrf(18);
Config.setConcurrency(4);
Config.setScale(1);
