import React from "react"
import { StaticQuery, graphql } from "gatsby"

import "./layout.css"

const Layout = ({ children }) => (
  <StaticQuery
    query={graphql`
      query SiteTitleQuery {
        site {
          siteMetadata {
            title
          }
        }
      }
    `}
    render={data => (
		<>
	        <h1>{data.site.siteMetadata.title}</h1>
			<main>{children}</main>
		</>
    )}
  />
)

export default Layout
