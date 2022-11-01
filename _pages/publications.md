---
layout: default
title: Publications
permalink: /publications
---
<!-- Posts Index
================================================== -->
<section class="recent-posts">

    <div class="section-title">

        <h2><span>All Publications</span></h2>

    </div>

    <div class="row listrecent">

        {% for post in site.categories["Publications"] %}

        {% include postbox.html %}

        {% endfor %}

    </div>

</section>
