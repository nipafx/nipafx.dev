import React from "react"

import { classNames } from "../infra/functions"

import * as style from "./postEnd.module.css"

const PostEnd = ({ type }) => <div {...classNames(style.block, style[type], "blockSeparator")} />

export default PostEnd
