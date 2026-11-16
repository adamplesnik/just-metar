// library build entry: pulls in the stylesheet (emitted as style.css) without
// leaking a CSS import into the published type declarations
import './styles.css'

export * from './index'
