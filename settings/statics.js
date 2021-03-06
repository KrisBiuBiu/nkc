const path = require('path');
const defaultPath = path.resolve('resources/default_things');
const attachIconPath = path.resolve('resources/attachIcon');
const watermark = path.resolve('resources/default_things/default_watermark3.png');
const fontTtf = path.resolve('resources/default_things/simsun.ttc');
const banner = path.resolve('resources/site_specific/ad_default.jpg');
const defaultPfBannerPath = defaultPath + '/default_pf_banner.jpg';
const defaultPfAvatarPath = defaultPath + '/default_pf_avatar.jpg';
const defaultAvatarPath = defaultPath + '/default_user_avatar.jpg';
const defaultAvatarSmallPath = defaultPath + '/default_user_avatar.jpg';
const defaultShopLogoPath = defaultPath + '/default_shopLogo.jpg';
const defaultThumbnailPath = defaultPath + '/default_thumb_image.jpg';
const defaultMediumPath = defaultPath + '/default_medium_image.jpg';
const defaultOriginPath = defaultPath + '/default_origin_image.jpg';
const siteSpecificPath = path.resolve('resources/site_specific');
const defaultAdPath = siteSpecificPath + '/ad_default.jpg';
const defaultImageResourcePath = defaultPath + '/default_resource_image.jpg';
const defaultUserBannerPath = defaultPath + '/default_user_banner.jpg';
const defaultMessageFilePath = defaultPath + '/default_resource_image.jpg';
const defaultMessageVideoFramePath = defaultPath + '/default_message_video_frame.jpg';
const defaultVideoCoverPath = defaultPath + '/videoCover.jpg';
const defaultForumBannerPath = defaultPath + "/forum_banner.jpg";
const defaultColumnAvatarPath = defaultPath + "/column_avatar.jpg";
const defaultColumnBannerPath = defaultPath + "/column_banner.jpg";
const defaultPosterPath = defaultPath + "/default_poster.jpg";

const staticPath = path.resolve('public/statics');
const defaultRoleIconPath = staticPath + '/role_icon';
module.exports = {
  siteSpecificPath,
  defaultRoleIconPath,
  watermark,
  banner,
  fontTtf,
  defaultPfBannerPath,
  defaultPfAvatarPath,
  defaultAvatarPath,
  defaultAvatarSmallPath,
  defaultShopLogoPath,
  defaultThumbnailPath,
  defaultMediumPath,
  defaultOriginPath,
	defaultUserBannerPath,
  defaultPath,
  attachIconPath,
  defaultAdPath,
  defaultImageResourcePath,
  defaultMessageVideoFramePath,
  defaultMessageFilePath,
  defaultForumBannerPath,
  defaultVideoCoverPath,

  defaultColumnAvatarPath,
  defaultColumnBannerPath,

  defaultPosterPath

};
